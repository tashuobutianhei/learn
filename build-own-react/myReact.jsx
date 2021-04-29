function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => (typeof child === 'object' ? child : createTextElement(child))),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createDom(fiber) {
  const dom = fiber.type == 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

const isEvent = key => key.startsWith('on');
const isProperty = key => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);
function updateDom(dom, prevProps, nextProps) {
  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function useState(initial) {
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = action(hook.state);
  });

  const setState = action => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

const Didact = {
  createElement,
  render,
  useState,
}

// function Counter() {
//   const [state, setState] = Didact.useState(1)
//   return (
//     <h1 onClick={() => setState(c => c + 1)}>
//       Count: {state}
//     </h1>
//   )
// }
// const element = <Counter />

// const element = {
//   type: 'div',
//   children: [1]
// }
const element = Didact.createElement(
  "div",
  { id: "foo" },
  Didact.createElement("a", null, "bar"),
  Didact.createElement("b")
)

console.log(element);
const container = document.getElementById("root")
Didact.render(element, container)

/**
 * 0: 含义
 *  const element = <h1 title="foo">Hello</h1>
    const container = document.getElementById("root")
    ReactDOM.render(element, container)
    使用react只需要三行，定义react element，获取真实dom元素，利用render方法进行渲染
    如果是用纯js怎么搞？
    createElement：
      首先：react element不使用jsx，而使用纯js，那么就不能直接这样写了。jsx被类似babel转化成js，这种转换也可以在react中被叫做createElement，需要传入，tag，props，children
      比如这样：
        const element = React.createElement(
          "h1",
          { title: "foo" },
          "Hello"
        )
      react element有很多属性，最核心的就是type 和 props，
        type是一个字符 / 函数，用于指定我们需要创建的dom，它可以是document.createElement中的tagName，也可以是函数
        props 有很多属性，还有一个最特别的是children
          children：可以是一个字符串，也可是一个数组，树结构也就这样来了。
    render：
      render是更改dom的函数
      简单的来说，render就是把createElement创建出的结构，渲染成真实的dom
        比如：
        const element = {
          type: "h1",
          props: {
            title: "foo",
            children: "Hello",
          },
        }
        const text = document.createTextNode("")
        text["nodeValue"] = element.props.children
        const container = document.getElementById("root")
        node.appendChild(text)
        container.appendChild(node)

 * 1: creatElement:
 *    有这么一个case：
  *     const element = (
          <div id="foo">
            <a>bar</a>
            <b />
          </div>
        )
        写成createElement参数就是：
        const element = React.createElement(
          "div",
          { id: "foo" },
          React.createElement("a", null, "bar"),
          React.createElement("b")
        )
        为了解析这段，那么creatElement就需要总一定的处理：
        function createElement(type, props, ...children) {
          return {
            type,
            props: {
              ...props,
              children: children.map(child => (typeof child === 'object' ? child : createTextElement(child))),
            },
          };
        }
        会处理成一个树结构，在递归的最底层，转成文本结点，
        这个文本结点也需要是一个react element结构，给他一个特殊type，TEXT_ELEMENT，会在create dom的时候进行处理
        function createTextElement(text) {
          return {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: text,
              children: [],
            },
          };
        }
        最终结构会变成:
        {
          type: 'div',
          props: { 
            children: [
              {
              type: 'a',
              props: {
                children: [
                  {
                    type: 'TEXT_ELEMENT',
                    props: {
                      nodeValue: 'bar',
                      children: [],
                    },
                  }
                ]
              }
            }, 
            {
              type: 'b',
              props: {
                children: [],
              },
            }] 
          }
        }

  2: 有了上面的结构后就进入render的过程：我们先只考虑渲染元素，不考虑更新
      function render(element, container) {
        // 首先按着type创建dom元素，还需要把props的属性加入的dom中
        const dom =
          element.type == "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(element.type)
      ​
        const isProperty = key => key !== "children"
        // 这时候要注意的是要过滤掉children
        Object.keys(element.props)
          .filter(isProperty)
          .forEach(name => {
            dom[name] = element.props[name]
          })
      ​  // 然后对于children进行递归操作，建立一颗dom树
        element.props.children.forEach(child =>
          render(child, dom)
        )
      ​
        container.appendChild(dom)
      }
      好了最简单的render完成
  
  3: Concurrent Mode
      看了上面的代码其实有个很严重的问题：递归调用（卡）
      一旦开始render，就没办法停下来，如果dom树很大，就会阻塞主线程，如果浏览器需要执行更高优的操作也得等到渲染完成。
      所以就需要把任务拆成一个个的单元，没完成一个就交给浏览器去执行。
      ps：先使用requestIdleCallback来处理，（react并没有requestIdleCallback，而是自己实现的scheduler）
      requestIdleCallback挺好的一点，也可提供给我们距离浏览器控制还有多久时间，我们可以用这个时长来判断是否渲染
      Concurrent Mode还没正式使用，现在的实现大概这样：

      let nextUnitOfWork = null
      ​
      function workLoop(deadline) {
        let shouldYield = false
        // 如果有需要渲染的微任务并且可执行
        while (nextUnitOfWork && !shouldYield) {
          nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
          )
          // 可执行的时间
          shouldYield = deadline.timeRemaining() < 1
        }
        requestIdleCallback(workLoop)
      }
      ​
      requestIdleCallback(workLoop)
      ​
      function performUnitOfWork(nextUnitOfWork) {
        // TODO
      }

    4: fibers
      有了调度规划，现在的问题是，需要一个数据结构去进行调度判断： fiber tree
      一个fiber对应一个element，一个fiber对应一个工作单元
      拿这么一颗dom树举例：
        <div>
          <h1>
            <p />
            <a />
          </h1>
          <h2 />
        </div>,
        会渲染成这样的fiber tree

        在render流程中，我们创建了root fiber 然后把它作为第一个nextUnitOfWork。
        在空闲时间会去触发performUnitOfWork，这个函数做了三件事：
          1. 把这个元素添加到dom中
          2. 把这个元素的children转化成fibers
          3. 选择下一个工作单元

        ps: fiber另一个目的就是方便去找下一个工作单元，会把每一个fiber和first child，next sibling 和 parent链接
        经过fiber树的关系，就方便去找下一个工作单元了：
        首先从root开始，优先找child，如果没有child就会找sibling，如果没有sibling也没有children，就会去找uncle结点，然后依次遍历。

        有了fiber和scheduler后就可以优化render了，其实我们之前的render更像是createDom就会变成这样
            function createDom(fiber) {
              const dom =
                fiber.type == "TEXT_ELEMENT"
                  ? document.createTextNode("")
                  : document.createElement(fiber.type)
            ​
              const isProperty = key => key !== "children"
              Object.keys(fiber.props)
                .filter(isProperty)
                .forEach(name => {
                  dom[name] = fiber.props[name]
                })
            ​
              return dom
            }
            ​
            function render(element, container) {
              // TODO set next unit of work
            }
            ​
            let nextUnitOfWork = null
        而在真正的render中，需要设置nextUnitOfWork，这个第一个nextUnitOfWork就是root fiber，当浏览器ready后，我们就进入workLoop了，从root开始工作
        这时候就要使用performUnitOfWork了：
          function performUnitOfWork(fiber) {
            // 新建dom，并且加到fiber.dom 
            if (!fiber.dom) {
              fiber.dom = createDom(fiber)
            }
          ​
            if (fiber.parent) {
              fiber.parent.dom.appendChild(fiber.dom)
            }
          ​
            const elements = fiber.props.children
            let index = 0
            let prevSibling = null
          ​
            // 给没改child都创建一个fiber
            while (index < elements.length) {
              const element = elements[index]
          ​
              const newFiber = {
                type: element.type,
                props: element.props,
                parent: fiber,
                dom: null,
              }
          ​
              if (index === 0) {
                fiber.child = newFiber
              } else {
                prevSibling.sibling = newFiber
              }
          ​
              prevSibling = newFiber
              index++
            }
          ​ // 按照优先级找到nextFiber
            if (fiber.child) {
              return fiber.child
            }
            let nextFiber = fiber
            while (nextFiber) {
              if (nextFiber.sibling) {
                return nextFiber.sibling
              }
              nextFiber = nextFiber.parent
            }
          }
    5:  render and commit
          新问题来了，我们在上面的操作是不断添加dom的，但是浏览器是会阻塞我们完成渲染整棵树的，就会导致用户看不到完成的页面
          所以要把performUnitOfWork里这段干掉，
            if (fiber.parent) {
              fiber.parent.dom.appendChild(fiber.dom)
            }
          取而代之的是维护一个结构wipRoot
          当我们完成里所有的unit work我们会把这个完整的fiber进行commit
          ps：之所以可以判断是否完整，就是利用没有下一个 unit work
          if (!nextUnitOfWork && wipRoot) {
            commitRoot()
          }
          function commitRoot() {
            // TODO add nodes to dom
          }
 */ 