"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type VolunteerFormProps = {
  roleOptions: string[];
};

const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzEuqAwL-nu-AUGKxzpgwtCajc8bsE071pS8yCLgw0RZsfpisJ3SbLl-TluM0VDFiyaaQ/exec";

type SubmitState = "idle" | "submitting" | "success" | "error";

const VolunteerForm = ({ roleOptions }: VolunteerFormProps) => {
  const normalizedRoleOptions = useMemo(() => roleOptions.filter(Boolean), [roleOptions]);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isSubmitting = submitState === "submitting";

  return (
    <form
      id="volunteerForm"
      className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitState("submitting");
        setErrorMessage("");

        const formEl = e.currentTarget;
        const formData = new FormData(formEl);
        const data = Object.fromEntries(formData.entries());

        try {
          const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "text/plain;charset=utf-8",
              Accept: "application/json",
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
          }

          let parsed: unknown = null;
          try {
            parsed = await response.json();
          } catch {
            parsed = null;
          }

          if (
            parsed &&
            typeof parsed === "object" &&
            "success" in parsed &&
            (parsed as { success?: unknown }).success === false
          ) {
            throw new Error("Server returned success=false");
          }

          setSubmitState("success");
          formEl.reset();
        } catch {
          setSubmitState("error");
          setErrorMessage("कुछ समस्या हुई। कृपया दोबारा कोशिश करें।");
        }
      }}
    >
      <div className="grid gap-4">
        {submitState === "success" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            आपका आवेदन सफलतापूर्वक प्राप्त हुआ ✅
          </div>
        )}
        {submitState === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {errorMessage || "सबमिट नहीं हो पाया। कृपया बाद में कोशिश करें।"}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="volunteer_name" className="text-sm font-medium text-foreground">
              नाम
            </label>
            <Input id="volunteer_name" name="name" placeholder="आपका नाम" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="volunteer_email" className="text-sm font-medium text-foreground">
              ईमेल
            </label>
            <Input id="volunteer_email" name="email" type="email" placeholder="आपका ईमेल" required />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="volunteer_mobile" className="text-sm font-medium text-foreground">
            मोबाइल नंबर
          </label>
          <Input
            id="volunteer_mobile"
            name="mobile"
            type="tel"
            inputMode="tel"
            placeholder="मोबाइल नंबर"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="volunteer_role" className="text-sm font-medium text-foreground">
            आप किस भूमिका में जुड़ना चाहते हैं?
          </label>
          <select
            id="volunteer_role"
            name="role"
            required
            defaultValue=""
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              भूमिका चुनें
            </option>
            {normalizedRoleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="volunteer_message" className="text-sm font-medium text-foreground">
            आप क्यों जुड़ना चाहते हैं?
          </label>
          <Textarea
            id="volunteer_message"
            name="message"
            rows={4}
            placeholder="संक्षेप में बताएं..."
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="volunteer_weekly" className="text-sm font-medium text-foreground">
            उपलब्ध समय (Weekly commitment)
          </label>
          <select
            id="volunteer_weekly"
            name="weekly_commitment"
            required
            defaultValue=""
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              समय चुनें
            </option>
            <option value="2-4">2-4 घंटे</option>
            <option value="4-6">4-6 घंटे</option>
            <option value="6-10">6-10 घंटे</option>
            <option value="10+">10+ घंटे</option>
          </select>
        </div>

        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting}>
          {isSubmitting ? "सबमिट हो रहा है..." : "आवेदन सबमिट करें"}
        </Button>

        <p className="text-xs text-muted-foreground">
          सबमिट करने के बाद पेज रीलोड नहीं होगा। आपकी जानकारी सुरक्षित रूप से दर्ज हो जाएगी।
        </p>
      </div>
    </form>
  );
};

export default VolunteerForm;
