import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // First check if we have a user preference in localStorage
    const saved = localStorage.getItem("theme");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Handle legacy boolean values
        if (typeof parsed === "boolean") {
          return parsed ? "dark" : "light";
        }
        // Handle string values
        if (["light", "dark", "system"].includes(parsed)) {
          return parsed;
        }
      } catch {
        // Handle legacy string values like "dark" or "light"
        if (saved === "dark" || saved === "light") {
          return saved;
        }
      }
    }
    return "system"; // Default to system preference
  });

  const [isDark, setIsDark] = useState(false);

  // Function to determine if dark mode should be active
  const getIsDark = (currentTheme) => {
    if (currentTheme === "dark") return true;
    if (currentTheme === "light") return false;
    // For system theme, check system preference
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  useEffect(() => {
    const darkMode = getIsDark(theme);
    setIsDark(darkMode);
    localStorage.setItem("theme", JSON.stringify(theme));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [theme]);

  // Listen for system theme changes when theme is set to "system"
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        const darkMode = getIsDark(theme);
        setIsDark(darkMode);
        document.documentElement.classList.toggle("dark", darkMode);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const setThemePreference = (newTheme) => {
    if (["light", "dark", "system"].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  // Method to sync theme from user data
  const syncThemeFromUser = (userTheme) => {
    if (userTheme && ["light", "dark", "system"].includes(userTheme)) {
      setTheme(userTheme);
    }
  };

  const toggleTheme = () => {
    // Toggle between light and dark, keep system as is
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      // If system, toggle to opposite of current system preference
      setTheme(isDark ? "light" : "dark");
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark,
      setTheme: setThemePreference,
      syncThemeFromUser,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
