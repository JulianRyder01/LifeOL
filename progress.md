### 代码改进指南

本指南旨在解决 `app.tsx` 文件中存在的代码组织、可维护性、性能和可扩展性问题。核心思想是将庞大的 `App` 组件分解为更小、更专注的模块，以实现“高内聚低耦合”。

#### 1\. 重构为自定义 Hook：解耦状态管理和业务逻辑

`App.tsx` 中包含了大量的状态（`attributes`, `events`, `items` 等）和处理函数。我们将这些逻辑抽离成自定义 Hook，让 `App` 组件只专注于渲染。

**具体步骤：**

1.  **创建 `hooks` 目录**: 在 `src` 目录下创建一个 `hooks` 文件夹。

2.  **创建 `useApp` Hook**: 这是一个核心 Hook，将管理大部分顶层状态。

      * 将 `attributes`, `events`, `achievements`, `items`, `projectEvents`, `selectedTitles`, `userConfig` 的 `useState` 和 `useEffect` 逻辑从 `App.tsx` 中剪切到 `src/hooks/useApp.ts` 文件中。
      * 将 `handleAddEvent`, `handleDeleteEvent`, `handleUpdateEvent` 等与事件相关的处理函数也移到这个 Hook 中。
      * 这个 Hook 应该返回所有状态和处理函数，供 `App` 组件使用。


3.  **更新 `App.tsx`**:

      * 删除所有与状态和处理函数相关的 `useState` 和 `useEffect` 声明。
      * 在 `App` 组件内部，使用 `const { attributes, events, ..., handleAddEvent, ... } = useApp();` 来调用新的 Hook。
      * `App` 组件的 `return` 部分保持不变，因为它只是将这些状态和函数作为 props 传递给子组件。

#### 2\. 使用 Context API 避免 Props Drilling

目前 `attributes`、`events`、`achievements` 等状态需要被多个深层嵌套的子组件访问。与其层层传递，不如使用 Context API。

**具体步骤：**

1.  **创建 Context**: 在 `src/contexts` 目录下创建 `AppContext.tsx`。

    ```typescript
    import React, { createContext, useContext, ReactNode } from 'react';
    import { useApp } from '../hooks/useApp';
    import { Attributes, Event, Achievement, Item, ProjectEvent, UserConfig } from '../types/app.types';

    // 定义 Context 的类型
    interface AppContextType {
      attributes: Attributes;
      events: Event[];
      //... 其他所有状态和处理函数
      handleAddEvent: (eventData: any) => void;
    }

    const AppContext = createContext<AppContextType | undefined>(undefined);

    export const AppProvider = ({ children }: { children: ReactNode }) => {
      const appState = useApp();
      return (
        <AppContext.Provider value={appState}>
          {children}
        </AppContext.Provider>
      );
    };

    export const useAppContext = () => {
      const context = useContext(AppContext);
      if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
      }
      return context;
    };
    ```

2.  **更新 `App.tsx`**:

      * 用 `<AppProvider>` 包裹整个应用。
      * `App` 组件内部不再需要 `useApp` Hook，它会变成一个纯粹的容器，负责渲染和切换页面。
      * 将所有状态和处理函数作为 `props` 传递给子组件的逻辑保持不变。**注意：** 这里的建议是**渐进式**的。你可以选择性地将一些深层组件重构为使用 `useAppContext`，而 `App.tsx` 仍然可以作为顶层状态的集中点，继续将 `props` 传递给一级子组件。

#### 3\. 按功能划分目录结构

为了提高代码的可读性和可维护性，将相关联的文件放在一起。

**建议的目录结构：**

```
src/
├── components/
│   ├── AllActivitiesView.tsx
│   ├── AchievementModal.tsx
│   ├── EventModal.tsx
│   ├── Header.tsx
│   ├── NotFound.tsx
│   └── (保留顶层共享组件)
│
├── features/  (新目录：按功能划分)
│   ├── achievements/
│   │   ├── AchievementSystem.tsx
│   │   ├── useAchievements.ts (Hook)
│   │   ├── utils.ts (成就相关的工具函数)
│   │   └── types.ts (成就相关的类型)
│   │
│   ├── events/
│   │   ├── EventManager.tsx
│   │   ├── EventList.tsx
│   │   ├── useEvents.ts (Hook)
│   │   └── ...
│   │
│   ├── items/
│   │   ├── ItemSystem.tsx
│   │   ├── useItems.ts (Hook)
│   │   └── ...
│   │
│   └── tasks/
│       ├── TaskManager.tsx
│       ├── useTasks.ts (Hook)
│       └── ...
│
├── hooks/
│   └── useApp.ts
│
├── types/
│   └── app.types.ts
│
├── utils/
│   ├── storage.ts
│   ├── calculations.ts
│   ├── achievements.ts (保留公共成就逻辑，或移入 features/achievements)
│   └── userConfig.ts
│
└── App.tsx
```

**具体步骤：**

1.  创建 `features` 目录。
2.  将 `EventManager`, `ItemSystem`, `TaskManager`, `AchievementSystem`, `UserSettings` 等组件分别移动到其对应的功能子目录中。
3.  将与这些组件紧密相关的工具函数和类型定义也移动到相应的子目录中，例如将 `checkAchievements` 相关的函数移入 `features/achievements/utils.ts`。

#### 4\. 优化异步操作和用户反馈

目前代码中的用户反馈方式不够优雅，我们可以使用一个通知库来改进。

**具体步骤：**

1.  **安装通知库**: 例如 `react-toastify`。

    ```bash
    npm install react-toastify
    ```

2.  **引入和配置**: 在 `App.tsx` 或顶层组件中引入。

    ```typescript
    import { ToastContainer, toast } from 'react-toastify';
    import 'react-toastify/dist/ReactToastify.css';

    function App() {
      //...
      return (
        <>
          <ToastContainer position="bottom-right" autoClose={3000} />
          <ErrorBoundary>
            {/*... 你的应用内容 */}
          </ErrorBoundary>
        </>
      );
    }
    ```

3.  **替换 `alert` 和 `console.log`**:

      * 在 `undoUseItem` 函数中，将 `alert('超过两小时，无法撤销使用');` 替换为 `toast.error('超过两小时，无法撤销使用');`。
      * 在 `checkAttributeDecay` 相关的 `useEffect` 中，将 `console.log` 替换为 `toast.warn('您的属性正在衰减...');` 或更详细的提示。
      * 在 `handleCompleteProjectEvent` 中，可以添加 `toast.success('项目已完成，奖励已发放！');`。

#### 5\. 改进配置和常量管理

为了增强可配置性，将硬编码的数值和字符串提取到常量文件中。

**具体步骤：**

1.  **创建 `constants` 目录**: 在 `src` 目录下创建 `constants/index.ts`。

2.  **提取常量**: 将 `attributeNames`、衰减检查间隔时间、撤销道具使用的时间限制等数值放入此文件。

    ```typescript
    export const ATTRIBUTE_NAMES: Record<string, string> = {
      int: '智力',
      str: '体魄',
      //...
    };

    export const DECAY_CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1小时

    export const UNDO_ITEM_USE_LIMIT_HOURS = 2; // 撤销道具使用限制
    ```

3.  **在 `App.tsx` 和其他文件中引用**:

    ```typescript
    import { ATTRIBUTE_NAMES, UNDO_ITEM_USE_LIMIT_HOURS } from './constants';

    // ...
    const hoursDiff = Math.abs(now.getTime() - usedTime.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > UNDO_ITEM_USE_LIMIT_HOURS) {
      //...
    }
    ```

通过以上步骤，你将能够显著提高代码的组织性、可维护性和性能，同时保持应用原有的UI和功能。