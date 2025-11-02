import { useEffect } from "react";

export function useBackButtonClick(handler: () => void) {
  useEffect(() => {
    window.addEventListener("back-button-click", handler);
    return () => {
      window.removeEventListener("back-button-click", handler);
    };
  }, [handler]);
}