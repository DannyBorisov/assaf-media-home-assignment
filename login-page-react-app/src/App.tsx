import { useState } from "react";
import styles from "./App.module.css";
import useLogin from "./api/auth";
import { TokenName } from "./api/client";

const Steps = {
  Login: "login",
  OTP: "otp",
};

function App() {
  const [currentStep, setCurrentStep] = useState<string>(Steps.Login);
  const [username, setUsername] = useState<string>("");
  const [honeyPot, setHoneyPot] = useState<string>("");
  const [userOTP, setUserOTP] = useState<string>("");

  const { handleLogin, isLoading, handleOTPVerification } = useLogin();

  function onClick() {
    if (currentStep === Steps.Login) {
      setCurrentStep(Steps.OTP);
    } else {
      handleOTPVerification(username, honeyPot);
    }
  }

  function onChange(value: string) {
    if (currentStep === Steps.Login) {
      setUsername(value);
    }
    if (currentStep === Steps.OTP) {
      setUserOTP(value);
    }
  }

  function handleSubmit() {
    if (currentStep === Steps.OTP) {
      handleOTPVerification(username, userOTP).then((token) =>
        localStorage.setItem(TokenName, token)
      );
      return;
    } else {
      handleLogin(username).then(() => setCurrentStep(Steps.OTP));
    }
  }

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account to continue</p>
        </div>

        <form
          className={styles.form}
          onSubmit={async (e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className={styles.input}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter your username"
              type="text"
              disabled={isLoading}
              value={username}
              required
            />
          </div>

          <input
            type="text"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
            name="email_confirm"
            value={honeyPot}
            onChange={(e) => setHoneyPot(e.target.value)}
          />

          <LoginButton onClick={onClick} isLoading={isLoading} />
        </form>
      </div>
    </div>
  );
}

export default App;

interface LoginButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({ isLoading, onClick }) => {
  function renderText() {
    if (isLoading) {
      return (
        <>
          <span className={styles.spinner}></span>
          Loading...
        </>
      );
    }
    return "Login";
  }

  return (
    <button
      type="submit"
      className={`${styles.btn} ${isLoading ? styles.btnLoading : ""}`}
      disabled={isLoading}
      onClick={onClick}
    >
      {renderText()}
    </button>
  );
};
