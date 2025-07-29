~~~mermaid
graph TD
    subgraph "用户端Client-Side"
        A[用户User] -- "操作e.g., 记录事件" --> B{浏览器Browser};
        B -- "UI交互" --> C[React应用Vite];
        C -- "状态管理Zustand/Redux" --> D[应用状态];
        C -- "HTTP请求Axios/Fetch" --> E[API客户端];
    end

    subgraph "云端基础设施Cloud Infrastructure"
        F[DNS / CDN<br>e.g., Cloudflare, AWS CloudFront] -- "域名解析/内容加速" --> G[负载均衡器Load Balancer<br>e.g., Nginx, ALB];
        G -- "流量转发" --> H[API网关API Gateway];
    end

    subgraph "云端核心服务Cloud Backend - NestJS"
        H -- "路由/认证/限流" --> I{核心API服务NestJS App};
        
        subgraph "NestJS 内部模块"
            I --> I_Auth[Auth Module<br>用户认证, JWT];
            I --> I_User[User Module<br>用户信息, 角色];
            I --> I_Event[Event/Log Module<br>事件CRUD];
            I --> I_Attr[Attribute Module<br>属性/等级计算];
            I --> I_Habit[Habit/Goal Module<br>习惯打卡];
            I --> I_Achieve[Achievement Module<br>成就判断];
            I --> I_Report[Report Module<br>报告生成触发];
        end

        I_Event -- "发布'EventCreated'事件" --> J[内部事件总线Event Bus];
        J -- "通知" --> I_Attr;
        J -- "通知" --> I_Achieve;

        I_Report -- "发送任务消息" --> K[消息队列Message Queue<br>e.g., RabbitMQ, SQS];
    end
    
    subgraph "后台异步服务Async Services"
        L[后台工作进程Worker<br>独立的Node.js服务] -- "消费任务" --> K;
        L -- "执行耗时任务<br>1. 生成周报/月报<br>2. 检查周期性事件<br>3. 调用AI服务" --> M{AI 伴侣小O<br>LLM API / 私有模型};
        L -- "将结果写入" --> N;
    end

    subgraph "数据与存储层Data & Storage"
        N[PostgreSQL 数据库RDS]
        O[对象存储Object Storage<br>e.g., AWS S3, MinIO]
        P[缓存Cache<br>e.g., Redis]
    end

    %% 连接关系
    E -- "API CallHTTPS" --> F;
    I_Auth --> N;
    I_User --> N;
    I_Event --> N;
    I_Event -- "图片URL" --> O;
    I_Attr --> N;
    I_Habit --> N;
    I_Achieve --> N;
    L --> N;
    M -- "分析结果" --> L;
    
    I -- "读写缓存" --> P;
    I_Auth -- "存储Session/Token" --> P;
~~~