# Workflow Builder - Spring Boot Backend Integration Guide

## Overview
This document outlines how to integrate the React workflow builder with a Spring Boot backend for production use.

## Backend Architecture

### 1. Database Schema

```sql
-- Workflows table
CREATE TABLE workflows (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('draft', 'running', 'completed', 'error') DEFAULT 'draft',
    nodes JSON NOT NULL,
    edges JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version INT DEFAULT 1,
    user_id VARCHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Workflow executions table
CREATE TABLE workflow_executions (
    id VARCHAR(36) PRIMARY KEY,
    workflow_id VARCHAR(36) NOT NULL,
    status ENUM('running', 'completed', 'failed', 'stopped') DEFAULT 'running',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    execution_data JSON,
    error_message TEXT,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

-- Node execution logs
CREATE TABLE node_execution_logs (
    id VARCHAR(36) PRIMARY KEY,
    execution_id VARCHAR(36) NOT NULL,
    node_id VARCHAR(255) NOT NULL,
    status ENUM('processing', 'completed', 'error') DEFAULT 'processing',
    progress INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    input_data JSON,
    output_data JSON,
    error_message TEXT,
    FOREIGN KEY (execution_id) REFERENCES workflow_executions(id)
);
```

### 2. Spring Boot Entities

```java
@Entity
@Table(name = "workflows")
public class Workflow {
    @Id
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @Enumerated(EnumType.STRING)
    private WorkflowStatus status;
    
    @Column(columnDefinition = "JSON")
    private String nodes;
    
    @Column(columnDefinition = "JSON")
    private String edges;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private Integer version;
    
    @Column(name = "user_id")
    private String userId;
    
    // Getters and setters
}

@Entity
@Table(name = "workflow_executions")
public class WorkflowExecution {
    @Id
    private String id;
    
    @Column(name = "workflow_id")
    private String workflowId;
    
    @Enumerated(EnumType.STRING)
    private ExecutionStatus status;
    
    @CreationTimestamp
    private LocalDateTime startedAt;
    
    private LocalDateTime completedAt;
    
    @Column(columnDefinition = "JSON")
    private String executionData;
    
    private String errorMessage;
    
    // Getters and setters
}
```

### 3. REST API Endpoints

```java
@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {
    
    @Autowired
    private WorkflowService workflowService;
    
    @GetMapping
    public ResponseEntity<List<WorkflowDTO>> getAllWorkflows() {
        return ResponseEntity.ok(workflowService.getAllWorkflows());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<WorkflowDTO> getWorkflow(@PathVariable String id) {
        return ResponseEntity.ok(workflowService.getWorkflow(id));
    }
    
    @PostMapping
    public ResponseEntity<WorkflowDTO> createWorkflow(@RequestBody CreateWorkflowRequest request) {
        return ResponseEntity.ok(workflowService.createWorkflow(request));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<WorkflowDTO> updateWorkflow(@PathVariable String id, @RequestBody UpdateWorkflowRequest request) {
        return ResponseEntity.ok(workflowService.updateWorkflow(id, request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable String id) {
        workflowService.deleteWorkflow(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/execute")
    public ResponseEntity<WorkflowExecutionDTO> executeWorkflow(@PathVariable String id) {
        return ResponseEntity.ok(workflowService.executeWorkflow(id));
    }
    
    @PostMapping("/{id}/stop")
    public ResponseEntity<Void> stopWorkflow(@PathVariable String id) {
        workflowService.stopWorkflow(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/executions")
    public ResponseEntity<List<WorkflowExecutionDTO>> getExecutions(@PathVariable String id) {
        return ResponseEntity.ok(workflowService.getExecutions(id));
    }
}
```

## Frontend Integration Changes

### 1. Update useWorkflowState Hook

```typescript
// Replace localStorage operations with API calls
export const useWorkflowState = () => {
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveWorkflow = useCallback(async (workflow?: WorkflowState) => {
    const workflowToSave = workflow || currentWorkflow;
    if (!workflowToSave) {
      toast.error('No workflow to save');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/workflows', {
        method: workflowToSave.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: workflowToSave.id,
          name: workflowToSave.name,
          description: workflowToSave.description,
          nodes: workflowToSave.nodes,
          edges: workflowToSave.edges,
          status: workflowToSave.status
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save workflow');
      
      const savedWorkflow = await response.json();
      setCurrentWorkflow(savedWorkflow);
      toast.success('Workflow saved successfully');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkflow]);

  const loadWorkflow = useCallback(async (workflowId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (!response.ok) throw new Error('Failed to load workflow');
      
      const workflow = await response.json();
      setCurrentWorkflow(workflow);
      toast.success('Workflow loaded successfully');
      return workflow;
    } catch (error) {
      console.error('Failed to load workflow:', error);
      toast.error('Failed to load workflow');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ... other methods
};
```

### 2. Real-time Execution Updates

```typescript
// Add WebSocket connection for real-time updates
const useWorkflowExecution = (workflowId: string) => {
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('idle');
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});

  useEffect(() => {
    if (!workflowId) return;

    const ws = new WebSocket(`ws://localhost:8080/api/workflows/${workflowId}/execution-updates`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      if (update.type === 'execution_status') {
        setExecutionStatus(update.status);
      } else if (update.type === 'node_status') {
        setNodeStatuses(prev => ({
          ...prev,
          [update.nodeId]: {
            status: update.status,
            progress: update.progress,
            error: update.error
          }
        }));
      }
    };

    return () => ws.close();
  }, [workflowId]);

  return { executionStatus, nodeStatuses };
};
```

## Workflow Execution Engine

### 1. Workflow Executor Service

```java
@Service
public class WorkflowExecutorService {
    
    @Autowired
    private NodeExecutorFactory nodeExecutorFactory;
    
    @Autowired
    private WorkflowExecutionRepository executionRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Async
    public CompletableFuture<Void> executeWorkflow(String workflowId) {
        WorkflowExecution execution = createExecution(workflowId);
        
        try {
            Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new WorkflowNotFoundException(workflowId));
            
            List<Node> executionOrder = calculateExecutionOrder(workflow.getNodes(), workflow.getEdges());
            
            for (Node node : executionOrder) {
                if (execution.getStatus() == ExecutionStatus.STOPPED) {
                    break;
                }
                
                executeNode(execution.getId(), node);
            }
            
            execution.setStatus(ExecutionStatus.COMPLETED);
            execution.setCompletedAt(LocalDateTime.now());
            
        } catch (Exception e) {
            execution.setStatus(ExecutionStatus.FAILED);
            execution.setErrorMessage(e.getMessage());
        } finally {
            executionRepository.save(execution);
            notifyExecutionStatus(workflowId, execution.getStatus());
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    private void executeNode(String executionId, Node node) {
        NodeExecutor executor = nodeExecutorFactory.getExecutor(node.getType());
        
        NodeExecutionLog log = new NodeExecutionLog();
        log.setExecutionId(executionId);
        log.setNodeId(node.getId());
        log.setStatus(NodeExecutionStatus.PROCESSING);
        
        notifyNodeStatus(executionId, node.getId(), NodeExecutionStatus.PROCESSING, 0);
        
        try {
            NodeExecutionResult result = executor.execute(node);
            
            log.setStatus(NodeExecutionStatus.COMPLETED);
            log.setOutputData(result.getOutputData());
            log.setCompletedAt(LocalDateTime.now());
            
            notifyNodeStatus(executionId, node.getId(), NodeExecutionStatus.COMPLETED, 100);
            
        } catch (Exception e) {
            log.setStatus(NodeExecutionStatus.ERROR);
            log.setErrorMessage(e.getMessage());
            
            notifyNodeStatus(executionId, node.getId(), NodeExecutionStatus.ERROR, 0);
            throw e;
        } finally {
            nodeExecutionLogRepository.save(log);
        }
    }
    
    private void notifyNodeStatus(String executionId, String nodeId, NodeExecutionStatus status, int progress) {
        Map<String, Object> update = Map.of(
            "type", "node_status",
            "nodeId", nodeId,
            "status", status,
            "progress", progress
        );
        
        messagingTemplate.convertAndSend("/topic/workflow-execution/" + executionId, update);
    }
}
```

### 2. Node Executor Interface

```java
public interface NodeExecutor {
    NodeExecutionResult execute(Node node) throws NodeExecutionException;
    boolean supports(String nodeType);
}

@Component
public class DataSourceNodeExecutor implements NodeExecutor {
    
    @Override
    public NodeExecutionResult execute(Node node) throws NodeExecutionException {
        // Implementation for data source node execution
        Map<String, Object> config = node.getConfig();
        String sourceType = (String) config.get("sourceType");
        
        switch (sourceType) {
            case "csv":
                return executeCsvDataSource(config);
            case "database":
                return executeDatabaseDataSource(config);
            case "api":
                return executeApiDataSource(config);
            default:
                throw new NodeExecutionException("Unsupported data source type: " + sourceType);
        }
    }
    
    @Override
    public boolean supports(String nodeType) {
        return "dataSource".equals(nodeType);
    }
    
    private NodeExecutionResult executeCsvDataSource(Map<String, Object> config) {
        // CSV processing logic
        return new NodeExecutionResult(processedData);
    }
}
```

## Security Considerations

### 1. Authentication & Authorization

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/workflows/**").authenticated()
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtDecoder(jwtDecoder()))
            );
        
        return http.build();
    }
}
```

### 2. Input Validation

```java
@PostMapping
public ResponseEntity<WorkflowDTO> createWorkflow(@Valid @RequestBody CreateWorkflowRequest request) {
    // Validate workflow structure
    validateWorkflowStructure(request.getNodes(), request.getEdges());
    return ResponseEntity.ok(workflowService.createWorkflow(request));
}

private void validateWorkflowStructure(List<Node> nodes, List<Edge> edges) {
    // Validate node connections
    // Check for circular dependencies
    // Validate node configurations
}
```

## Deployment Configuration

### 1. Application Properties

```properties
# Database configuration
spring.datasource.url=jdbc:mysql://localhost:3306/workflow_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate

# WebSocket configuration
spring.websocket.enabled=true

# Async execution
spring.task.execution.pool.core-size=10
spring.task.execution.pool.max-size=50
spring.task.execution.pool.queue-capacity=1000

# File upload limits (for CSV data sources)
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

### 2. Docker Configuration

```dockerfile
FROM openjdk:17-jdk-slim
COPY target/workflow-engine-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## Testing Strategy

### 1. Unit Tests

```java
@ExtendWith(MockitoExtension.class)
class WorkflowExecutorServiceTest {
    
    @Mock
    private NodeExecutorFactory nodeExecutorFactory;
    
    @Mock
    private WorkflowExecutionRepository executionRepository;
    
    @InjectMocks
    private WorkflowExecutorService workflowExecutorService;
    
    @Test
    void executeWorkflow_shouldCompleteSuccessfully() {
        // Test implementation
    }
}
```

### 2. Integration Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
class WorkflowControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void createWorkflow_shouldReturnCreatedWorkflow() {
        // Integration test implementation
    }
}
```

This integration guide provides a comprehensive roadmap for connecting your React workflow builder with a Spring Boot backend, including database design, API implementation, real-time updates, and security considerations.
