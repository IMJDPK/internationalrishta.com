"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingBureaus, setPendingBureaus] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingPayments: 0,
    totalBureaus: 0,
    pendingBureaus: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/en/auth/signin");
      return;
    }

    // Check if user is admin
    const { data: adminData } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!adminData) {
      alert("Access Denied: You are not authorized to view this page");
      router.push("/en");
      return;
    }

    setIsAdmin(true);
    loadDashboardData();
  };

  const loadDashboardData = async () => {
    const supabase = createClient();

    // Load pending users
    const { data: users } = await supabase
      .from("profiles")
      .select("*")
      .in("payment_status", ["pending", "payment_sent"])
      .order("created_at", { ascending: false });

    setPendingUsers(users || []);

    // Load pending bureaus
    const { data: bureaus } = await supabase
      .from("marriage_bureaus")
      .select("*")
      .in("status", ["pending", "payment_pending"])
      .order("created_at", { ascending: false });

    setPendingBureaus(bureaus || []);

    // Load stats
    const { count: totalUsersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: activeUsersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("account_active", true);

    const { count: totalBureausCount } = await supabase
      .from("marriage_bureaus")
      .select("*", { count: "exact", head: true });

    setStats({
      totalUsers: totalUsersCount || 0,
      activeUsers: activeUsersCount || 0,
      pendingPayments: (users || []).length,
      totalBureaus: totalBureausCount || 0,
      pendingBureaus: (bureaus || []).length,
    });

    setIsLoading(false);
  };

  const approveUser = async (userId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        payment_status: "verified",
        account_active: true,
        payment_verified_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      alert("Error approving user: " + error.message);
    } else {
      alert("User activated successfully!");
      loadDashboardData();
    }
  };

  const rejectUser = async (userId: string) => {
    if (!confirm("Are you sure you want to reject this user's payment?"))
      return;

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        payment_status: "failed",
      })
      .eq("id", userId);

    if (error) {
      alert("Error rejecting user: " + error.message);
    } else {
      alert("User payment rejected");
      loadDashboardData();
    }
  };

  const approveBureau = async (bureauId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("marriage_bureaus")
      .update({
        status: "approved",
        verified: true,
        registration_fee_paid: true,
        payment_verified_at: new Date().toISOString(),
        licensed_at: new Date().toISOString(),
      })
      .eq("id", bureauId);

    if (error) {
      alert("Error approving bureau: " + error.message);
    } else {
      alert("Bureau approved successfully!");
      loadDashboardData();
    }
  };

  const rejectBureau = async (bureauId: string) => {
    if (!confirm("Are you sure you want to reject this bureau?")) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("marriage_bureaus")
      .update({
        status: "rejected",
      })
      .eq("id", bureauId);

    if (error) {
      alert("Error rejecting bureau: " + error.message);
    } else {
      alert("Bureau rejected");
      loadDashboardData();
    }
  };

  if (isLoading || !isAdmin) {
    return (
      <main className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-white">Verifying admin access...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-900 min-h-screen">
      <Navigation />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">Manage payments and approvals</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold text-white">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Active Users</p>
              <p className="text-3xl font-bold text-green-500">
                {stats.activeUsers}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Pending Payments</p>
              <p className="text-3xl font-bold text-yellow-500">
                {stats.pendingPayments}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Total Bureaus</p>
              <p className="text-3xl font-bold text-white">
                {stats.totalBureaus}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Pending Bureaus</p>
              <p className="text-3xl font-bold text-yellow-500">
                {stats.pendingBureaus}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "users"
                  ? "bg-gold-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Pending Users ({stats.pendingPayments})
            </button>
            <button
              onClick={() => setActiveTab("bureaus")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "bureaus"
                  ? "bg-gold-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Pending Bureaus ({stats.pendingBureaus})
            </button>
          </div>

          {/* Content */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {pendingUsers.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
                  <p className="text-gray-400 text-lg">
                    No pending user payments
                  </p>
                </div>
              ) : (
                pendingUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-xl font-bold text-white">
                            {user.full_name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.payment_status === "payment_sent"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {user.payment_status === "payment_sent"
                              ? "Payment Sent"
                              : "Pending"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Email</p>
                            <p className="text-white">{user.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Phone</p>
                            <p className="text-white">
                              {user.phone || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Plan</p>
                            <p className="text-white capitalize">
                              {user.subscription_tier}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">
                              Registered
                            </p>
                            <p className="text-white">
                              {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-900 rounded p-3 mb-4">
                          <p className="text-gray-400 text-sm mb-1">
                            Expected Amount
                          </p>
                          <p className="text-2xl font-bold text-white">
                            PKR{" "}
                            {user.subscription_tier === "referral"
                              ? "3,999"
                              : "4,999"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 ml-6">
                        <button
                          onClick={() => approveUser(user.id)}
                          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => rejectUser(user.id)}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === "bureaus" && (
            <div className="space-y-4">
              {pendingBureaus.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
                  <p className="text-gray-400 text-lg">
                    No pending bureau approvals
                  </p>
                </div>
              ) : (
                pendingBureaus.map((bureau) => (
                  <motion.div
                    key={bureau.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-xl font-bold text-white">
                            {bureau.name}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-500">
                            {bureau.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">City</p>
                            <p className="text-white">{bureau.city}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Phone</p>
                            <p className="text-white">{bureau.phone}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Email</p>
                            <p className="text-white">{bureau.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">
                              License
                            </p>
                            <p className="text-white">
                              {bureau.license_number}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-900 rounded p-3 mb-4">
                          <p className="text-gray-400 text-sm mb-1">Address</p>
                          <p className="text-white">{bureau.address}</p>
                        </div>

                        <div className="bg-gray-900 rounded p-3">
                          <p className="text-gray-400 text-sm mb-1">
                            Registration Fee
                          </p>
                          <p className="text-2xl font-bold text-white">
                            PKR 10,000
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 ml-6">
                        <button
                          onClick={() => approveBureau(bureau.id)}
                          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => rejectBureau(bureau.id)}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
