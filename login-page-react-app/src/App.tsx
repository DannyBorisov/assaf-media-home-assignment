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
  const [error, setError] = useState<string>("");

  const { handleLogin, isLoading, handleOTPVerification } = useLogin();

  function onClick() {
    if (currentStep === Steps.Login) {
      handleLogin(username, honeyPot)
        .then(() => setCurrentStep(Steps.OTP))
        .catch((err) => {
          setError(err);
          setTimeout(() => {
            setError("");
          }, 1000);
        });
    } else {
      handleOTPVerification(username, honeyPot);
    }
  }

  function handleSubmit() {
    if (currentStep === Steps.OTP) {
      handleOTPVerification(username, userOTP).then((token) =>
        localStorage.setItem(TokenName, token)
      );
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
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form
          className={styles.form}
          onSubmit={async (e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">
              {currentStep === Steps.OTP ? "Enter OTP" : "Username"}
            </label>
            {currentStep === Steps.Login && (
              <input
                id="username"
                className={styles.input}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                type="text"
                disabled={isLoading}
                value={username}
                required
              />
            )}
            {currentStep === Steps.OTP && (
              <input
                id="otp"
                className={styles.input}
                onChange={(e) => setUserOTP(e.target.value)}
                placeholder="Enter OTP"
                type="text"
                disabled={isLoading}
                value={userOTP}
                required
              />
            )}
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

          <LoginButton
            onClick={onClick}
            isLoading={isLoading}
            text={currentStep === Steps.Login ? "Login" : "Submit"}
          />
        </form>
      </div>
    </div>
  );
}

export default App;

interface LoginButtonProps {
  isLoading: boolean;
  onClick: () => void;
  text: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  isLoading,
  onClick,
  text,
}) => {
  function renderText() {
    if (isLoading) {
      return (
        <>
          <span className={styles.spinner}></span>
          Loading...
        </>
      );
    }
    return text;
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
