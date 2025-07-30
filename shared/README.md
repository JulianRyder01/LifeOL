# LifeOL 共享类型定义

这个目录包含了前后端共享的 TypeScript 类型定义，确保前后端数据结构的一致性。

## 目录结构

```
shared/
├── types/
│   ├── attribute.types.ts     # 属性相关类型
│   ├── event.types.ts         # 事件相关类型
│   ├── project-event.types.ts # 项目事件相关类型
│   ├── item.types.ts          # 道具相关类型
│   ├── achievement.types.ts   # 成就相关类型
│   ├── config.types.ts        # 配置相关类型
│   └── user.types.ts          # 用户相关类型
└── README.md
```

## 使用说明

### 前端使用

在前端项目中，可以通过相对路径导入共享类型：

```typescript
import { Attributes } from '../../shared/types/attribute.types';
import { Event } from '../../shared/types/event.types';
```

### 后端使用

在后端项目中，可以通过相对路径导入共享类型：

```typescript
import { Attributes } from '../../shared/types/attribute.types';
import { Event } from '../../shared/types/event.types';
```

## 类型同步

为了确保前后端类型的一致性，请注意：

1. 所有数据模型的类型定义都应该放在这里
2. 前后端都应该使用这些共享类型，而不是重复定义
3. 当需要修改数据结构时，应该先更新共享类型，再分别更新前后端代码
4. 保持类型定义的简洁性和通用性，避免包含特定于前端或后端的逻辑