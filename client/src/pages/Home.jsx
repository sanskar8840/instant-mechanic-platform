import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CarFront,
  ShieldCheck,
  Wrench,
  Activity,
  ArrowRight,
} from "lucide-react";

import { getHealth } from "../services/api";

const portals = [
  {
    title: "Customer Portal",
    description:
      "Book vehicle services, manage vehicles and track assistance live.",
    icon: CarFront,
    badge: "Customer",
    loginPath: "/customer/login",
    registerPath: "/customer/register",
    buttonText: "Customer Login",
    accent: "blue",
  },
  {
    title: "Mechanic Portal",
    description:
      "Receive assigned jobs, update progress and complete services.",
    icon: Wrench,
    badge: "Mechanic",
    loginPath: "/mechanic/login",
    registerPath: "/mechanic/register",
    buttonText: "Mechanic Login",
    accent: "emerald",
  },
  {
    title: "Admin Portal",
    description:
      "Manage bookings, mechanics, customers and business analytics.",
    icon: ShieldCheck,
    badge: "Admin",
    loginPath: "/admin/login",
    registerPath: null,
    buttonText: "Admin Login",
    accent: "purple",
  },
];

export default function Home() {
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    async function checkApi() {
      try {
        const data = await getHealth();

        if (active) {
          setApiStatus(data.success ? "online" : "offline");
        }
      } catch {
        if (active) {
          setApiStatus("offline");
        }
      }
    }

    checkApi();

    return () => {
      active = false;
    };
  }, []);

  const getButtonClasses = (accent) => {
    if (accent === "emerald") {
      return "bg-emerald-600 hover:bg-emerald-500";
    }

    if (accent === "purple") {
      return "bg-purple-600 hover:bg-purple-500";
    }

    return "bg-blue-600 hover:bg-blue-500";
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                <Activity size={16} />
                Phase 2 Authentication
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                Vehicle assistance, managed from one platform.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                One platform for customers, mechanics and operations teams.
                Secure role-based authentication is now active for all three
                portals.
              </p>
            </div>

            <div className="min-w-52 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                Backend status
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    apiStatus === "online"
                      ? "bg-emerald-500"
                      : apiStatus === "checking"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />

                <span className="font-semibold capitalize text-slate-900">
                  {apiStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {portals.map(
              ({
                title,
                description,
                icon: Icon,
                badge,
                loginPath,
                registerPath,
                buttonText,
                accent,
              }) => (
                <article
                  key={title}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
                      <Icon size={22} />
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                      {badge}
                    </span>
                  </div>

                  <h2 className="mt-6 text-xl font-bold text-slate-950">
                    {title}
                  </h2>

                  <p className="mt-2 min-h-20 text-sm leading-6 text-slate-600">
                    {description}
                  </p>

                  <Link
                    to={loginPath}
                    className={`mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${getButtonClasses(
                      accent
                    )}`}
                  >
                    {buttonText}
                    <ArrowRight size={16} />
                  </Link>

                  {registerPath && (
                    <p className="mt-4 text-sm text-slate-500">
                      New here?{" "}
                      <Link
                        to={registerPath}
                        className="font-semibold text-slate-900 hover:underline"
                      >
                        Create account
                      </Link>
                    </p>
                  )}

                  {!registerPath && (
                    <p className="mt-4 text-sm text-slate-500">
                      Admin accounts are created securely by the system.
                    </p>
                  )}
                </article>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}