import __vite__cjsImport0_react_jsxDevRuntime from "/@fs/Users/lirenzhang/Desktop/Course Planner/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=38913640"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/@fs/Users/lirenzhang/Desktop/Course Planner/node_modules/.vite/deps/react.js?v=38913640"; const React = ((m) => m?.__esModule ? m : { ...typeof m === "object" && !Array.isArray(m) || typeof m === "function" ? m : {}, default: m })(__vite__cjsImport1_react);
import __vite__cjsImport2_reactDom_client from "/@fs/Users/lirenzhang/Desktop/Course Planner/node_modules/.vite/deps/react-dom_client.js?v=38913640"; const ReactDOM = ((m) => m?.__esModule ? m : { ...typeof m === "object" && !Array.isArray(m) || typeof m === "function" ? m : {}, default: m })(__vite__cjsImport2_reactDom_client);
import App from "/src/App.tsx";
import "/src/index.css";
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
function updateDarkClass(e = null) {
  const isDark = e ? e.matches : darkQuery.matches;
  document.documentElement.classList.toggle("dark", isDark);
}
updateDarkClass();
darkQuery.addEventListener("change", updateDarkClass);
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxDEV(React.StrictMode, { children: /* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
    fileName: "/Users/lirenzhang/Desktop/Course Planner/client/src/main.tsx",
    lineNumber: 19,
    columnNumber: 5
  }, this) }, void 0, false, {
    fileName: "/Users/lirenzhang/Desktop/Course Planner/client/src/main.tsx",
    lineNumber: 18,
    columnNumber: 3
  }, this)
);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBa0JJO0FBbEJKLFlBQVlBLFdBQVc7QUFDdkIsWUFBWUMsY0FBYztBQUMxQixPQUFPQyxTQUFTO0FBRWhCLE9BQU87QUFFUCxNQUFNQyxZQUFZQyxPQUFPQyxXQUFXLDhCQUE4QjtBQUVsRSxTQUFTQyxnQkFBZ0JDLElBQUksTUFBTTtBQUNqQyxRQUFNQyxTQUFTRCxJQUFJQSxFQUFFRSxVQUFVTixVQUFVTTtBQUN6Q0MsV0FBU0MsZ0JBQWdCQyxVQUFVQyxPQUFPLFFBQVFMLE1BQU07QUFDMUQ7QUFFQUYsZ0JBQWdCO0FBQ2hCSCxVQUFVVyxpQkFBaUIsVUFBVVIsZUFBZTtBQUVwREwsU0FBU2MsV0FBV0wsU0FBU00sZUFBZSxNQUFNLENBQUMsRUFBRUM7QUFBQUEsRUFDbkQsdUJBQUMsTUFBTSxZQUFOLEVBQ0MsaUNBQUMsU0FBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQUksS0FETjtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBRUE7QUFDRiIsIm5hbWVzIjpbIlJlYWN0IiwiUmVhY3RET00iLCJBcHAiLCJkYXJrUXVlcnkiLCJ3aW5kb3ciLCJtYXRjaE1lZGlhIiwidXBkYXRlRGFya0NsYXNzIiwiZSIsImlzRGFyayIsIm1hdGNoZXMiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsImNsYXNzTGlzdCIsInRvZ2dsZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJjcmVhdGVSb290IiwiZ2V0RWxlbWVudEJ5SWQiLCJyZW5kZXIiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsibWFpbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0ICogYXMgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tL2NsaWVudCc7XG5pbXBvcnQgQXBwIGZyb20gJy4vQXBwJztcblxuaW1wb3J0ICcuL2luZGV4LmNzcyc7XG5cbmNvbnN0IGRhcmtRdWVyeSA9IHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspJyk7XG5cbmZ1bmN0aW9uIHVwZGF0ZURhcmtDbGFzcyhlID0gbnVsbCkge1xuICBjb25zdCBpc0RhcmsgPSBlID8gZS5tYXRjaGVzIDogZGFya1F1ZXJ5Lm1hdGNoZXM7XG4gIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdkYXJrJywgaXNEYXJrKTtcbn1cblxudXBkYXRlRGFya0NsYXNzKCk7XG5kYXJrUXVlcnkuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdXBkYXRlRGFya0NsYXNzKTtcblxuUmVhY3RET00uY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpKS5yZW5kZXIoXG4gIDxSZWFjdC5TdHJpY3RNb2RlPlxuICAgIDxBcHAgLz5cbiAgPC9SZWFjdC5TdHJpY3RNb2RlPixcbik7XG4iXSwiZmlsZSI6Ii9Vc2Vycy9saXJlbnpoYW5nL0Rlc2t0b3AvQ291cnNlIFBsYW5uZXIvY2xpZW50L3NyYy9tYWluLnRzeCJ9