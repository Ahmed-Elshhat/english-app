// "use client"
// import {
//   createContext,
//   ReactNode,
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// type WindowContextType = {
//   windowSize: number;
// };

// const WindowContext = createContext<WindowContextType | null>(null);

// function WindowProvider({ children }: { children: ReactNode }) {
//   const [windowSize, setWindowSize] = useState<number>(window.innerWidth);

//   useEffect(() => {
//     function setWindowWidth() {
//       setWindowSize(window.innerWidth);
//     }

//     window.addEventListener("resize", setWindowWidth);

//     // CleanUp Function
//     return () => {
//       window.removeEventListener("resize", setWindowWidth);
//     };
//   }, []);

//   return (
//     <WindowContext.Provider value={{ windowSize }}>
//       {children}
//     </WindowContext.Provider>
//   );
// }

// export default WindowProvider;

// export const useWindow = () => {
//   return useContext(WindowContext);
// };

"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type WindowContextType = {
  windowSize: number;
};

const WindowContext = createContext<WindowContextType | null>(null);

function WindowProvider({ children }: { children: ReactNode }) {
  const [windowSize, setWindowSize] = useState<number>(0); // ✅ مبدئياً صفر

  useEffect(() => {
    function setWindowWidth() {
      setWindowSize(window.innerWidth);
    }

    setWindowWidth(); // ✅ أول مرة بعد ما يركب الكومبوننت
    window.addEventListener("resize", setWindowWidth);

    return () => {
      window.removeEventListener("resize", setWindowWidth);
    };
  }, []);

  return (
    <WindowContext.Provider value={{ windowSize }}>
      {children}
    </WindowContext.Provider>
  );
}

export default WindowProvider;

export const useWindow = () => {
  return useContext(WindowContext);
};
