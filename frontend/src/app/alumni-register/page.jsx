"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  graduationYear: "",
  degree: "",
  department: "",
  currentCompany: "",
  jobTitle: "",
  experience: "",
  location: "",
  linkedin: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .required("Full name is required."),

  email: Yup.string()
    .trim()
    .email("Enter a valid email address.")
    .required("Email address is required."),

  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number.")
    .required("Phone number is required."),

  graduationYear: Yup.number()
    .typeError("Graduation year is required.")
    .integer("Enter a valid graduation year.")
    .min(1950, "Graduation year cannot be before 1950.")
    .max(
      new Date().getFullYear() + 10,
      "Enter a valid graduation year."
    )
    .required("Graduation year is required."),

  degree: Yup.string().required("Please select your degree."),

  department: Yup.string()
    .trim()
    .required("Department is required."),

  currentCompany: Yup.string().trim(),

  jobTitle: Yup.string().trim(),

  experience: Yup.string(),

  location: Yup.string().trim(),

  linkedin: Yup.string()
    .trim()
    .test(
      "valid-linkedin",
      "Enter a valid LinkedIn profile URL.",
      (value) =>
        !value ||
        Yup.string().url().isValidSync(value)
    ),

  password: Yup.string()
    .min(8, "Password must contain at least 8 characters.")
    .required("Password is required."),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match.")
    .required("Please confirm your password."),

  agreeToTerms: Yup.boolean().oneOf(
    [true],
    "You must accept the Terms of Service and Privacy Policy."
  ),
});

export default function AlumniRegisterPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");

  const formik = useFormik({
    initialValues,
    validationSchema,

    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setApiError("");
      setSuccess("");

      try {
        // IMPORTANT:
        // Ensure this URL matches your actual backend route.
        // If your backend uses router.post("/add"), change
        // this URL to http://localhost:5000/api/alumni/add.

        const response = await fetch(
          "http://localhost:5000/alumni/add",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name: values.name.trim(),
              email: values.email.trim(),
              phone: values.phone,
              graduationYear: Number(values.graduationYear),
              degree: values.degree,
              department: values.department.trim(),
              currentCompany: values.currentCompany.trim(),
              jobTitle: values.jobTitle.trim(),
              experience: values.experience,
              location: values.location.trim(),
              linkedin: values.linkedin.trim(),
              password: values.password,
            }),
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message ||
              result.error ||
              `Registration failed (HTTP ${response.status}).`
          );
        }

        setSuccess(
          "Alumni registration successful! You can now sign in."
        );

        resetForm();
      } catch (error) {
        setApiError(
          error.message ||
            "Server se connection nahi ho pa raha. Backend server aur API route check karein."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Input styling
  const inputClass = `w-full rounded-xl border px-4 py-3 outline-none transition
    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
    ${
      darkMode
        ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
        : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400"
    }`;

  const labelClass = `mb-2 block text-sm font-semibold ${
    darkMode ? "text-slate-200" : "text-slate-700"
  }`;

  const mutedText = darkMode
    ? "text-slate-400"
    : "text-slate-500";

  // Formik field validation message
  const fieldError = (name) => {
    if (formik.touched[name] && formik.errors[name]) {
      return (
        <p className="mt-1 text-sm text-red-500" role="alert">
          {formik.errors[name]}
        </p>
      );
    }

    return null;
  };

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-[#f7f5ff] text-slate-900"
      }`}
    >
      {/* Navbar */}

      <header
        className={`sticky top-0 z-20 border-b backdrop-blur-xl ${
          darkMode
            ? "border-slate-800 bg-slate-950/90"
            : "border-purple-100 bg-white/90"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-xl font-black tracking-tight"
          >
            <span className="text-purple-600">ANP</span>

            <span className="ml-2 text-sm font-semibold">
              Alumni Network
            </span>
          </Link>

          {/* Light / Dark Mode Toggle */}

          <button
            type="button"
            onClick={() => setDarkMode((current) => !current)}
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              darkMode
                ? "border-slate-700 bg-slate-900 hover:bg-slate-800"
                : "border-purple-200 bg-white hover:bg-purple-50"
            }`}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </header>

      {/* Registration Section */}

      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-4xl">
          {/* Heading */}

          <div className="mb-9 text-center">
            <span className="mb-4 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
              Alumni Membership
            </span>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Join Your{" "}
              <span className="bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                Alumni Network
              </span>
            </h1>

            <p
              className={`mx-auto mt-4 max-w-xl text-sm leading-7 sm:text-base ${mutedText}`}
            >
              Reconnect with your college community, mentor students
              and discover exciting professional opportunities.
            </p>
          </div>

          {/* Form Card */}

          <div
            className={`overflow-hidden rounded-3xl border shadow-2xl ${
              darkMode
                ? "border-slate-800 bg-slate-900/80 shadow-black/20"
                : "border-white bg-white shadow-purple-900/10"
            }`}
          >
            <div className="h-2 bg-gradient-to-r from-purple-800 via-purple-500 to-amber-400" />

            <form
              onSubmit={formik.handleSubmit}
              noValidate
              className="space-y-9 p-5 sm:p-9"
            >
              {/* Personal Information */}

              <section>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                    👤
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Personal Information
                    </h2>

                    <p className={`text-sm ${mutedText}`}>
                      Tell us about yourself.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="name">
                      Full Name *
                    </label>

                    <input
                      id="name"
                      className={inputClass}
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />

                    {fieldError("name")}
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="email">
                      Email Address *
                    </label>

                    <input
                      id="email"
                      className={inputClass}
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />

                    {fieldError("email")}
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="phone">
                      Phone Number *
                    </label>

                    <input
                      id="phone"
                      className={inputClass}
                      type="tel"
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="10-digit phone number"
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={10}
                    />

                    {fieldError("phone")}
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="location">
                      Current Location
                    </label>

                    <input
                      id="location"
                      className={inputClass}
                      name="location"
                      value={formik.values.location}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="City, State"
                      autoComplete="address-level2"
                    />

                    {fieldError("location")}
                  </div>
                </div>
              </section>

              {/* Academic Information */}

              <section>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-xl">
                    🎓
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Academic Information
                    </h2>

                    <p className={`text-sm ${mutedText}`}>
                      Share your college and graduation details.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="degree">
                      Degree *
                    </label>

                    <select
                      id="degree"
                      className={inputClass}
                      name="degree"
                      value={formik.values.degree}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">Select degree</option>
                      <option value="B.Tech">B.Tech</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                      <option value="BBA">BBA</option>
                      <option value="MBA">MBA</option>
                      <option value="B.Sc">B.Sc</option>
                      <option value="M.Sc">M.Sc</option>
                      <option value="Other">Other</option>
                    </select>

                    {fieldError("degree")}
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor="department"
                    >
                      Department *
                    </label>

                    <input
                      id="department"
                      className={inputClass}
                      name="department"
                      value={formik.values.department}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Computer Science"
                    />

                    {fieldError("department")}
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor="graduationYear"
                    >
                      Graduation Year *
                    </label>

                    <input
                      id="graduationYear"
                      className={inputClass}
                      type="number"
                      name="graduationYear"
                      value={formik.values.graduationYear}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. 2023"
                      min="1950"
                      max={new Date().getFullYear() + 10}
                    />

                    {fieldError("graduationYear")}
                  </div>
                </div>
              </section>

              {/* Professional Information */}

              <section>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                    💼
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Professional Information
                    </h2>

                    <p className={`text-sm ${mutedText}`}>
                      Help students discover your career journey.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      className={labelClass}
                      htmlFor="currentCompany"
                    >
                      Current Company
                    </label>

                    <input
                      id="currentCompany"
                      className={inputClass}
                      name="currentCompany"
                      value={formik.values.currentCompany}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Company or organization"
                    />

                    {fieldError("currentCompany")}
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="jobTitle">
                      Job Title
                    </label>

                    <input
                      id="jobTitle"
                      className={inputClass}
                      name="jobTitle"
                      value={formik.values.jobTitle}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Software Developer"
                    />

                    {fieldError("jobTitle")}
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor="experience"
                    >
                      Work Experience
                    </label>

                    <select
                      id="experience"
                      className={inputClass}
                      name="experience"
                      value={formik.values.experience}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">Select experience</option>
                      <option value="Fresher">Fresher</option>
                      <option value="Less than 1 year">
                        Less than 1 year
                      </option>
                      <option value="1-3 years">1–3 years</option>
                      <option value="3-5 years">3–5 years</option>
                      <option value="5-10 years">5–10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>

                    {fieldError("experience")}
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="linkedin">
                      LinkedIn Profile
                    </label>

                    <input
                      id="linkedin"
                      className={inputClass}
                      type="url"
                      name="linkedin"
                      value={formik.values.linkedin}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="https://linkedin.com/in/your-profile"
                    />

                    {fieldError("linkedin")}
                  </div>
                </div>
              </section>

              {/* Account Security */}

              <section>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-xl">
                    🔐
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Account Security
                    </h2>

                    <p className={`text-sm ${mutedText}`}>
                      Create a secure account for your alumni profile.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      className={labelClass}
                      htmlFor="password"
                    >
                      Password *
                    </label>

                    <input
                      id="password"
                      className={inputClass}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                    />

                    {fieldError("password")}
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor="confirmPassword"
                    >
                      Confirm Password *
                    </label>

                    <input
                      id="confirmPassword"
                      className={inputClass}
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                    />

                    {fieldError("confirmPassword")}
                  </div>
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) =>
                      setShowPassword(event.target.checked)
                    }
                    className="h-4 w-4 accent-purple-600"
                  />

                  Show passwords
                </label>
              </section>

              {/* Terms and Conditions */}

              <div
                className={`rounded-xl border p-4 ${
                  darkMode
                    ? "border-slate-700 bg-slate-950/60"
                    : "border-purple-100 bg-purple-50/70"
                }`}
              >
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formik.values.agreeToTerms}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-1 h-4 w-4 shrink-0 accent-purple-600"
                  />

                  <span>
                    I agree to the Terms of Service and Privacy
                    Policy. I confirm that the information provided
                    above is accurate.
                  </span>
                </label>

                {fieldError("agreeToTerms")}
              </div>

              {/* API Error */}

              {apiError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700"
                >
                  {apiError}
                </div>
              )}

              {/* Success Message */}

              {success && (
                <div
                  role="status"
                  className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700"
                >
                  {success}
                </div>
              )}

              {/* Submit Button */}

              <div>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-800 via-purple-700 to-purple-600 px-6 py-4 font-bold text-white shadow-lg shadow-purple-900/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formik.isSubmitting
                    ? "Creating Your Account..."
                    : "Create Alumni Account →"}
                </button>

                <p className={`mt-5 text-center text-sm ${mutedText}`}>
                  Already registered?{" "}

                  <Link
                    href="/alumni-login"
                    className="font-bold text-purple-500 transition hover:text-amber-500"
                  >
                    Alumni-Login
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}

          <p className={`mt-7 text-center text-xs ${mutedText}`}>
            © {new Date().getFullYear()} ANP — Alumni–Student Networking Portal
          </p>
        </div>
      </section>
    </main>
  );
}