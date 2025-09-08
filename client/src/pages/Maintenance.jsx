import React, { useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { checkMaintenanceStatus, isMaintenanceMode } from "../config/axios";
import toast from "react-hot-toast";

const Maintenance = ({ message }) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await checkMaintenanceStatus();

      // Check if maintenance mode is still active
      if (!isMaintenanceMode()) {
        toast.success("System is back online!");
        // Reload to exit maintenance mode
        window.location.reload();
      } else {
        toast.info("System is still under maintenance.");
      }
    } catch (error) {
      toast.error("Unable to check system status. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
            System Maintenance
          </h1>
          <p className="text-lg text-[var(--clr-surface-a50)] mb-6">
            {message || "We're currently performing maintenance on our system. Please check back soon."}
          </p>
        </div>

        <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a10)] font-semibold mb-2 gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-md uppercase">Expected downtime</span>
          </div>
          <p className="text-md text-[var(--clr-surface-a50)]">
            We're working to improve your experience. The system should be back online shortly.
          </p>
        </div>

        <div className="flex xs:flex-col xs:gap-4 lg:gap-0 lg:flex-row items-center justify-evenly">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-fit px-5 py-3 bg-[var(--clr-surface-a30)] hover:bg-[var(--clr-surface-a40)] disabled:bg-[var(--clr-surface-a20)] disabled:cursor-not-allowed text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                Checking...
              </>
            ) : (
              "Check Status"
            )}
          </button>

          <button
            onClick={() => {
              window.location.href = '/admin-login';
            }}
            className="w-fit px-5 py-3 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Admin Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;