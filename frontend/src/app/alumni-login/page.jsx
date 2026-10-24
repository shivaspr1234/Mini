'use client';

import axios from 'axios';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import React from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

const AlumniLoginSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const AlumniLogin = () => {
  const router = useRouter();

  const loginForm = useFormik({
    initialValues: {
      email: '',
      password: '',
      remember: false,
    },
    validationSchema: AlumniLoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await axios.post('http://localhost:5000/alumni/login', {
          email: values.email,
          password: values.password,
        });

        const storage = values.remember ? localStorage : sessionStorage;
        storage.setItem('alumni', JSON.stringify(response.data.data));
        toast.success('Welcome back');
        router.push('/');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to sign in');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const inputClass = (field) => `
    w-full h-12 rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 dark:text-white
    outline-none transition placeholder:text-slate-400 focus:bg-white dark:bg-slate-900
    focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10
    ${loginForm.touched[field] && loginForm.errors[field]
      ? 'border-red-400'
      : 'border-slate-200 dark:border-slate-700'}
  `;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-amber-500/15 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-cyan-500/15 blur-3xl" />

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white dark:bg-slate-900/5 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-amber-500/25 via-orange-500/10 to-cyan-500/20 p-12 lg:flex xl:p-16">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-xl font-extrabold text-slate-950 shadow-lg shadow-amber-500/20">
              A
            </div>
            <span className="text-xl font-bold text-white">Alumni Network</span>
          </div>

          <div className="my-16">
            <span className="inline-flex rounded-full border border-amber-300/20 bg-white dark:bg-slate-900/10 px-4 py-2 text-sm font-medium text-amber-200">
              Alumni portal
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              Stay connected.
              <span className="block text-amber-300">Keep making an impact.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Sign in to connect with your college community, share opportunities, and support the next generation.
            </p>
          </div>

          <p className="text-xs text-slate-500">Alumni and Student Networking Portal</p>
        </div>

        <div className="bg-white dark:bg-slate-900 px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-lg font-extrabold text-slate-950">
                A
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">Alumni Network</span>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Alumni sign in</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Access your alumni profile and network.
              </p>
            </div>

            <form onSubmit={loginForm.handleSubmit} className="mt-8 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={inputClass('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={loginForm.values.email}
                  onChange={loginForm.handleChange}
                  onBlur={loginForm.handleBlur}
                />
                {loginForm.touched.email && loginForm.errors.email && (
                  <p className="mt-1 text-xs text-red-600">{loginForm.errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={inputClass('password')}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={loginForm.values.password}
                  onChange={loginForm.handleChange}
                  onBlur={loginForm.handleBlur}
                />
                {loginForm.touched.password && loginForm.errors.password && (
                  <p className="mt-1 text-xs text-red-600">{loginForm.errors.password}</p>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-xs text-slate-500">
                <input
                  type="checkbox"
                  name="remember"
                  checked={loginForm.values.remember}
                  onChange={loginForm.handleChange}
                  className="h-4 w-4 accent-amber-500"
                />
                Keep me signed in on this device
              </label>

              <button
                type="submit"
                disabled={loginForm.isSubmitting}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition duration-200 hover:from-amber-400 hover:to-orange-400 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginForm.isSubmitting ? 'Signing In...' : 'Sign In as Alumni'}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              New alumni member?
              <a href="/Alumni/Signup" className="ml-1 font-bold text-amber-600 hover:text-amber-700">
                Create an account
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AlumniLogin;
