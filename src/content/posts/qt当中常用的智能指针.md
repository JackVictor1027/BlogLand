---
title: QT当中常用的智能指针
date: 2026-08-22
updated: 2026-08-22
tags: ["C++", "QT", "智能指针"]
draft: true
---

在 Qt 开发中，除了经典的“父子对象树”内存管理机制外，Qt 也提供了一套完善的智能指针体系。Qt 的智能指针主要分为四类：**QScopedPointer**、**QSharedPointer**、**QWeakPointer** 和 **QPointer**。

---

## 1. QScopedPointer（独占式智能指针）
**作用**：类似于 C++11 的 `std::unique_ptr`。它用于管理动态分配对象的**独占所有权**。当指针离开作用域时，会自动释放对象，防止内存泄漏。

**代码示例**：
```cpp
#include <QScopedPointer>
#include <QDebug>

class Test {
public:
    Test() { qDebug() << "Test 构造"; }
    ~Test() { qDebug() << "Test 析构"; }
    void hello() { qDebug() << "Hello from Test"; }
};

void testScoped() {
    // 1. 创建独占智能指针
    QScopedPointer<Test> ptr(new Test());
    ptr->hello(); // 访问对象成员

    // 2. 替换管理的对象（旧对象会被自动 delete）
    ptr.reset(new Test()); 

    // 3. 放弃管理权（返回裸指针，需手动 delete）
    Test* rawPtr = ptr.take(); 
    delete rawPtr; 
} 
// 离开作用域时，如果 ptr 还在管理对象，会自动调用析构
```
**最佳实践**：适用于局部对象管理，优先用于非 QObject 类的独占资源。

**一个疑问**：如下图所示，很明显，这里被QScopedPointer指向的对象又被另外一个指针指向了，这矛盾吗？是不是不好的写法？

![alt text](/assets/images/1787378770597-image-1.png)

不矛盾，智能指针（QScopedPointer类型的per_ptr）一直持有对Per对象的所有权，但是裸指针（another_ptr）只持有对Per对象的读取权限。

**`QScopedPointer<Private> per_ptr`（所有者）**
    它拥有 `Per` 对象的**独占所有权**。它的职责是：当 `per_ptr` 被销毁时，确保 `Per` 对象也被自动释放，防止内存泄漏。它是这个对象的“主人”。
**`Per *another_ptr`（观察者/使用者）**
    它只是一个普通的裸指针，**不拥有任何所有权**。它的职责仅仅是：在函数执行期间，提供一个方便的入口来访问 `per_ptr` 所管理的对象。它是这个对象的“临时访客”。

### ⚠️ 仍需要注意的是

只有当裸指针试图**越权**时，才是危险的：

| 行为 | 是否安全 | 说明 |
| :--- | :--- | :--- |
| 用裸指针读取/修改对象成员 | ✅ 安全 | 正常的访问权使用 |
| 将裸指针传递给其他函数作为参数 | ✅ 安全 | 前提是接收方也不会尝试 delete |
| 对裸指针调用 `delete` | ❌ **危险** | 双重释放！所有权属于 `QScopedPointer` |
| 将裸指针存入另一个 `QScopedPointer` / `shared_ptr` | ❌ **危险** | 两个智能指针争夺同一对象的所有权 |
| 在 `QScopedPointer` 已析构后仍使用裸指针 | ❌ **危险** | 悬空指针，未定义行为 |

### 📌 智能指针和裸指针一起用要注意什么

**谁负责 `delete`？** → 只有 `QScopedPointer`

**裸指针是否尝试过 `delete` 或转移所有权？** → 没有

只要守住这条底线，“一个智能指针 + N个裸指针”就是安全、高效、符合 Qt 设计哲学的标准实践。

---

## 2. QSharedPointer（共享式智能指针）
**作用**：类似于 `std::shared_ptr`。多个指针可以共享同一个对象，内部通过**引用计数**管理生命周期。当最后一个 `QSharedPointer` 被销毁时，对象才会被释放。

**代码示例**：
```cpp
#include <QSharedPointer>

class Data {
public:
    Data() { qDebug() << "Data 构造"; }
    ~Data() { qDebug() << "Data 析构"; }
};

void testShared() {
    // 1. 推荐使用 create() 工厂方法进行原子构造（更安全）
    auto ptr1 = QSharedPointer<Data>::create(); 
    
    {
        // 2. 拷贝构造，引用计数 +1
        QSharedPointer<Data> ptr2 = ptr1; 
        qDebug() << "当前引用计数:" << ptr1.useCount(); // 输出 2
    } 
    // ptr2 离开作用域，引用计数 -1，但对象不会被销毁

    // 3. 判断是否为空
    if (!ptr1.isNull()) {
        qDebug() << "对象仍然存活";
    }
}
// ptr1 离开作用域，引用计数归 0，Data 析构
```
**最佳实践**：适用于需要多模块/多线程共享资源的场景（如流媒体缓冲区、视频帧等）。

---

## 3. QWeakPointer（弱引用智能指针）
**作用**：专门配合 `QSharedPointer` 使用。它**不增加引用计数**，仅作为观察者存在。主要用于**打破循环引用**（解决你刚才问过的内存泄漏问题）。

**代码示例**：
```cpp
// 假设存在循环引用风险：A 持有 B，B 持有 A
class B;
class A {
public:
    QSharedPointer<B> b_ptr; // 强引用
};

class B {
public:
    QWeakPointer<A> a_ptr;   // 弱引用，打破循环！
    
    void doSomething() {
        // 必须通过 toStrongRef() 转换为强引用才能访问对象
        QSharedPointer<A> strongA = a_ptr.toStrongRef();
        if (strongA) {
            // 安全使用 strongA
        }
    }
};
```
**最佳实践**：永远不要直接用 `QWeakPointer` 访问对象，必须先 `toStrongRef()` 检查对象是否还活着。

---

## 4. QPointer（QObject 观察指针）
**作用**：这是 Qt **专为 `QObject` 及其子类设计的“防悬空指针工具”**。它**不负责释放内存**（生命周期仍由父子对象树管理），但当它指向的 `QObject` 被删除时，`QPointer` 会**自动置为 `nullptr`**，防止程序访问野指针崩溃。

**代码示例**：
```cpp
#include <QPointer>
#include <QWidget>

void testQPointer() {
    QWidget* widget = new QWidget();
    QPointer<QWidget> safePtr = widget; // 安全观察 widget

    // 模拟对象被销毁（比如父窗口关闭，或手动 delete）
    delete widget; 

    // 此时 widget 已经是悬空指针，但 safePtr 会自动变空！
    if (safePtr.isNull()) {
        qDebug() << "对象已被销毁，安全退出";
        return; 
    }
    safePtr->show(); // 如果对象还在，正常调用
}
```
**最佳实践**：在跨异步操作、Lambda 表达式捕获、或缓存 Widget 指针时，用 `QPointer` 代替裸指针，极其安全。

---

### 💡 核心避坑指南（非常重要）

1. **禁止混用**：绝对不要用裸指针和智能指针同时管理同一个对象，否则会导致 `double free`（双重释放）崩溃。
2. **避免与父子对象树冲突**：如果你把 `QSharedPointer` 管理的对象又设置了 `setParent()`，当父对象销毁时会 `delete` 子对象，而 `QSharedPointer` 析构时也会 `delete`，同样会引发双重释放。
3. **日常选择优先级**：
   - 管理普通 C++ 对象独占权：`QScopedPointer` (或 `std::unique_ptr`)
   - 共享资源：`QSharedPointer` (或 `std::shared_ptr`)
   - 观察 `QObject` 死活：`QPointer`
   - 解决 `QSharedPointer` 循环引用：`QWeakPointer`
