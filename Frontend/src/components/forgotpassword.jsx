import React, { useState } from "react";
import { Eye, EyeOff, CircleArrowLeft, ArrowLeft } from "lucide-react";
import { forgotPassword, verifyOtp, resetPassword } from "../api";
import { useNavigate } from "react-router-dom";
import { useToast } from '../context/useToast';

const steps = [
  "Your details",
  "Verify OTP",
  "Choose a password",
  "Successfully",
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center space-x-2 mt-6 md:mt-8">
      {steps.map((_, idx) => (
        <span
          key={idx}
          className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors duration-300 ${
            idx === current ? "bg-indigo-600" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function ForgotPasswordFlow() {
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState({
    email: "",
    otp: ["", "", "", ""], // 4-digit OTP
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (index, value) => {
    if (/^[0-9]{0,1}$/.test(value)) {
      const newOtp = [...fields.otp];
      newOtp[index] = value;
      setFields({ ...fields, otp: newOtp });

      // Focus next or prev input automatically
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
      if (!value && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!fields.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      const errorMessage = "Enter a valid email address.";
      showToast(errorMessage, 'error');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ identifier: fields.email });
      setStep(1);
      showToast('Password reset instructions sent to your email!', 'success');
    } catch (err) {
      const errorMessage = err.message || "Failed to send reset instructions.";
      showToast(errorMessage, 'error');
    }
    setLoading(false);
  };

  // Step 1: Verify OTP
  const handleVerifyOtp = async () => {
    if (fields.otp.some((digit) => digit === "")) {
      const errorMessage = "Enter all 4 digits of the OTP.";
      showToast(errorMessage, 'error');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp({ email: fields.email, otp: fields.otp.join("") });
      setStep(2);
      showToast('OTP verified successfully!', 'success');
    } catch (err) {
      const errorMessage = err.message || "Invalid OTP. Please try again.";
      showToast(errorMessage, 'error');
    }
    setLoading(false);
  };

  // Step 2: Set new password
  const handleResetPassword = async () => {
    if (!fields.password || fields.password.length < 8) {
      const errorMessage = "Password must be at least 8 characters.";
      showToast(errorMessage, 'error');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(fields.password)) {
      const errorMessage = "Password must have at least one special character.";
      showToast(errorMessage, 'error');
      return;
    }
    if (fields.password !== fields.confirmPassword) {
      const errorMessage = "Passwords do not match.";
      showToast(errorMessage, 'error');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ identifier: fields.email, newPassword: fields.password });
      setStep(3);
      showToast('Password reset successfully!', 'success');
    } catch (err) {
      const errorMessage = err.message || "Error setting password.";
      showToast(errorMessage, 'error');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await forgotPassword({ identifier: fields.email });
      showToast('OTP resent to your email!', 'success');
    } catch (err) {
      const errorMessage = err.message || "Failed to resend OTP. Please try again.";
      showToast(errorMessage, 'error');
    }
    setLoading(false);
  };

  const handleNext = async () => {
    if (step === 0) await handleForgotPassword();
    else if (step === 1) await handleVerifyOtp();
    else if (step === 2) await handleResetPassword();
    else if (step === 3) {
      showToast('Redirecting to login...', 'info');
      navigate("/login");
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      showToast('Going back to previous step...', 'info');
    } else {
      showToast('Redirecting to login...', 'info');
      navigate("/login");
    }
  };

  const handleLoginRedirect = () => {
    showToast('Redirecting to login...', 'info');
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Back Button */}
      <button
        onClick={handleBack}
        className="md:hidden absolute top-4 left-4 p-2 bg-white rounded-full shadow-md z-10"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Left Aside - Hidden on mobile */}
      <aside className="hidden md:flex flex-col w-1/3 border-r bg-white p-8 lg:p-10">
        <nav className="flex-1">
          <ol className="space-y-8 lg:space-y-10">
            {steps.map((label, idx) => (
              <li key={label} className="flex items-start gap-4">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step >= idx
                      ? "bg-indigo-500 scale-110 shadow-md"
                      : "bg-gray-300"
                  }`}
                >
                  {step > idx ? (
                    <span className="text-white text-xs font-bold">✓</span>
                  ) : (
                    <span className="text-white text-xs"></span>
                  )}
                </div>
                <div>
                  <div
                    className={
                      step === idx
                        ? "text-indigo-600 font-semibold text-sm lg:text-base"
                        : "text-gray-400 font-medium text-sm lg:text-base"
                    }
                  >
                    {label}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {idx === 0 && "Please enter your email address."}
                    {idx === 1 && "Verify the code delivered to your inbox."}
                    {idx === 2 && "Choose a secure password."}
                    {idx === 3 && "Go back to log in into your account."}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      {/* Right Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        <div className="max-w-md w-full bg-white text-center rounded-xl md:rounded-2xl shadow p-6 md:p-8">
          {/* Mobile Step Header */}
          <div className="md:hidden mb-6 text-center">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Step {step + 1} of {steps.length}
            </h3>
            <h4 className="text-lg font-semibold text-gray-900 mt-1">
              {steps[step]}
            </h4>
          </div>

          {step === 0 && (
            <>
              <h2 className="text-xl md:text-2xl font-semibold mb-2">Forgot password?</h2>
              <p className="text-gray-500 text-sm md:text-base mb-6">
                No worries, we'll send you reset instructions.
              </p>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                className="input w-full text-base md:text-lg px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={fields.email}
                onChange={handleChange}
              />
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-xl md:text-2xl font-semibold mb-2">Verify OTP</h2>
              <p className="text-gray-500 text-sm md:text-base mb-3">
                We sent a verification code to {fields.email}.
              </p>
              <div className="flex gap-2 md:gap-3 justify-center mb-4">
                {fields.otp.map((v, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    className="w-10 h-12 md:w-12 md:h-14 text-xl md:text-2xl font-bold rounded-lg bg-gray-100 text-center border border-transparent focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    value={v}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-400 mb-3">
                Didn't receive the email?{" "}
                <button
                  type="button"
                  className="text-indigo-500 underline"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Resend"}
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-xl md:text-2xl font-semibold mb-2">Set new password</h2>
              <p className="text-gray-500 text-sm md:text-base mb-6">
                Your new password must be different to previously used passwords.
              </p>
              <div className="relative w-full">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="input w-full text-base md:text-lg px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 pr-12"
                  value={fields.password}
                  onChange={handleChange}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              <div className="relative w-full mt-3">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className="input w-full text-base md:text-lg px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 pr-12"
                  value={fields.confirmPassword}
                  onChange={handleChange}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              <ul className="mt-3 text-xs text-gray-500 text-left list-inside list-disc space-y-1">
                <li>Must be at least 8 characters</li>
                <li>Must contain one special character</li>
              </ul>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-xl md:text-2xl font-semibold mb-2">Successfully</h2>
              <p className="text-gray-500 text-sm md:text-base mb-6">
                Your password has been successfully reset.
                <br />
                Click below to log in magically.
              </p>
            </>
          )}
          <button
            className={`mt-6 md:mt-8 w-full py-3 bg-indigo-600 text-white text-base md:text-lg font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 ${
              loading && "opacity-60 cursor-not-allowed"
            }`}
            disabled={loading}
            onClick={handleNext}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {step === 0 && "Sending..."}
                {step === 1 && "Verifying..."}
                {step === 2 && "Resetting..."}
                {step === 3 && "Continuing..."}
              </span>
            ) : (
              <>
                {step === 0 && "Reset password"}
                {step === 1 && "Verify OTP"}
                {step === 2 && "Reset password"}
                {step === 3 && "Continue"}
              </>
            )}
          </button>
          <StepIndicator current={step} />
          <div className="mt-4 text-center text-sm text-gray-400">
            Back to{" "}
            <button 
              onClick={handleLoginRedirect}
              className="text-indigo-600 underline hover:text-indigo-700"
            >
              log in
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}