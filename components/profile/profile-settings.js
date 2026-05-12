"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import SignOutButton from "@/components/common/sign-out-button";
import { useLocale } from "@/components/common/locale-provider";

const initialErrors = {
  name: [],
  currency: [],
  currentPassword: [],
  newPassword: [],
  confirmNewPassword: [],
};
const previewPageSize = 5;

export default function ProfileSettings({ initialProfile, signOutAction }) {
  const router = useRouter();
  const { messages, translateErrorMessage, setCurrency } = useLocale();
  const importSectionRef = useRef(null);
  const profileActionButtonClass = "inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold";
  const [formData, setFormData] = useState({
    name: initialProfile.name,
    email: initialProfile.email,
    currency: initialProfile.currency || "UAH",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState(initialErrors);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResettingData, setIsResettingData] = useState(false);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importMessage, setImportMessage] = useState("");
  const [importFormError, setImportFormError] = useState("");
  const [isPreviewingImport, setIsPreviewingImport] = useState(false);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [showImportResults, setShowImportResults] = useState(false);
  const [importPreviewPage, setImportPreviewPage] = useState(1);

  const totalPreviewPages = Math.max(1, Math.ceil(importPreview.length / previewPageSize));
  const paginatedPreview = importPreview.slice(
    (importPreviewPage - 1) * previewPageSize,
    importPreviewPage * previewPageSize
  );

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setSuccessMessage("");
  }

  function handleImportFileChange(event) {
    const nextFile = event.target.files?.[0] || null;
    setImportFile(nextFile);
    setImportSummary(null);
    setImportPreview([]);
    setImportMessage("");
    setImportFormError("");
    setShowImportResults(false);
    setImportPreviewPage(1);
  }

  async function submitCsvImport(mode) {
    if (!importFile) {
      setImportFormError(translateErrorMessage("CSV file is required."));
      return;
    }

    const setLoading = mode === "import" ? setIsImportingCsv : setIsPreviewingImport;
    setLoading(true);
    setImportFormError("");
    setImportMessage("");

    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("mode", mode);

      const response = await fetch("/api/import/csv", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setImportFormError(translateErrorMessage(data.error || "Unable to import transactions right now."));
        setImportSummary(data.summary || null);
        setImportPreview(
          (data.preview || []).map((row) => ({
            ...row,
            messages: row.messages?.map((message) => translateErrorMessage(message)) || [],
          }))
        );
        setShowImportResults(true);
        setImportPreviewPage(1);
        return;
      }

      setImportSummary(data.summary || null);
      setImportPreview(
        (data.preview || []).map((row) => ({
          ...row,
          messages: row.messages?.map((message) => translateErrorMessage(message)) || [],
        }))
      );
      setImportMessage(
        mode === "import" ? translateErrorMessage(data.message || "") : ""
      );
      setShowImportResults(true);
      setImportPreviewPage(1);

      if (mode === "import") {
        router.refresh();
      }
    } catch {
      setImportFormError(translateErrorMessage("Unable to import transactions right now."));
    } finally {
      setLoading(false);
    }
  }

  function openImportConfirmModal() {
    if (!importFile || isPreviewingImport || isImportingCsv) {
      return;
    }

    setShowImportConfirmModal(true);
  }

  async function confirmCsvImport() {
    setShowImportConfirmModal(false);
    await submitCsvImport("import");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors(initialErrors);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          currency: formData.currency,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.issues) {
          setFieldErrors({
            ...initialErrors,
            ...Object.fromEntries(
              Object.entries(data.issues.fieldErrors).map(([key, value]) => [
                key,
                value.map((item) => translateErrorMessage(item)),
              ])
            ),
          });
          setFormError(translateErrorMessage(data.issues.formErrors?.[0] || ""));
          return;
        }

        setFormError(translateErrorMessage(data.error || "Unable to save profile right now."));
        return;
      }

      setFormData((current) => ({
        ...current,
        name: data.user.name || "",
        currency: data.user.currency,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
      setCurrency(data.user.currency);
      setSuccessMessage(translateErrorMessage(data.message || "Profile updated successfully."));
      router.refresh();
    } catch {
      setFormError(translateErrorMessage("Unexpected error. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetAccountData() {
    setIsResettingData(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/profile/reset", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setFormError(
          translateErrorMessage(data.error || "Unable to clear account data right now.")
        );
        requestAnimationFrame(() => {
          importSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
        return;
      }

      setShowResetModal(false);
      setImportFile(null);
      setImportSummary(null);
      setImportPreview([]);
      setImportMessage("");
      setImportFormError("");
      setShowImportResults(false);
      setImportPreviewPage(1);
      setSuccessMessage(
        translateErrorMessage(data.message || "All account data has been cleared.")
      );
      requestAnimationFrame(() => {
        importSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      router.refresh();
    } catch {
      setFormError(translateErrorMessage("Unexpected error. Please try again."));
    } finally {
      setIsResettingData(false);
    }
  }

  function renderFieldError(fieldName) {
    const error = fieldErrors[fieldName]?.[0];

    if (!error) {
      return null;
    }

    return <p className="mt-2 text-sm text-rose-700">{error}</p>;
  }

  function getPreviewStatusLabel(status) {
    if (status === "ready") {
      return messages.importExport.previewStatusReady;
    }

    return messages.importExport.previewStatusInvalid;
  }

  function hideImportPreview() {
    setShowImportResults(false);
    setImportPreviewPage(1);

    requestAnimationFrame(() => {
      importSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div className="space-y-8">
      <section ref={importSectionRef} className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="space-y-3">
          <p className="eyebrow">{messages.profile.accountEyebrow}</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            {messages.profile.accountTitle}
          </h2>
          <p className="muted max-w-2xl text-sm leading-6">
            {messages.profile.accountDescription}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {messages.profile.name}
              </span>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              />
              {renderFieldError("name")}
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {messages.profile.email}
              </span>
              <input
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-[var(--border)] bg-stone-100 px-4 py-3 text-base text-[var(--muted)] outline-none"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {messages.profile.currency}
            </span>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
            >
              <option value="UAH">{messages.profile.currencies.UAH}</option>
              <option value="USD">{messages.profile.currencies.USD}</option>
              <option value="EUR">{messages.profile.currencies.EUR}</option>
            </select>
            {renderFieldError("currency")}
          </label>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/70 p-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {messages.profile.currentPassword}
              </p>
              <p className="text-sm text-[var(--muted)]">{messages.profile.passwordNote}</p>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {messages.profile.currentPassword}
                </span>
                <div className="relative">
                  <input
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 pr-24 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                  >
                    {showCurrentPassword ? messages.common.hide : messages.common.show}
                  </button>
                </div>
                {renderFieldError("currentPassword")}
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {messages.profile.newPassword}
                </span>
                <div className="relative">
                  <input
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 pr-24 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                  >
                    {showNewPassword ? messages.common.hide : messages.common.show}
                  </button>
                </div>
                {renderFieldError("newPassword")}
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {messages.profile.confirmNewPassword}
                </span>
                <div className="relative">
                  <input
                    name="confirmNewPassword"
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 pr-24 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                  >
                    {showConfirmNewPassword ? messages.common.hide : messages.common.show}
                  </button>
                </div>
                {renderFieldError("confirmNewPassword")}
              </label>
            </div>
          </div>

          {formError ? (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {formError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? messages.profile.saving : messages.profile.save}
          </button>
        </form>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-3">
            <p className="eyebrow">{messages.importExport.importEyebrow}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {messages.importExport.importTitle}
            </h2>
            <p className="muted max-w-2xl text-sm leading-6">
              {messages.importExport.importDescription}
            </p>
            <p className="text-sm font-medium text-[var(--foreground)]/70">
              {messages.importExport.importFormatNote}
            </p>
          </div>

          <div className="w-full max-w-xl space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {messages.importExport.importFileLabel}
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportFileChange}
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--accent-strong)]"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-[11.5rem]">
                <button
                  type="button"
                  onClick={() => submitCsvImport("preview")}
                  disabled={!importFile || isPreviewingImport || isImportingCsv}
                  className="inline-flex w-full items-center justify-center rounded-full border border-[var(--accent)] bg-white px-5 py-3 text-sm font-semibold text-[var(--accent-strong)] transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPreviewingImport
                    ? messages.importExport.previewing
                    : messages.importExport.previewButton}
                </button>
              </div>
              <div className="w-full sm:w-[11.5rem]">
                {showImportResults ? (
                  <button
                    type="button"
                    onClick={hideImportPreview}
                    className="inline-flex w-full items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]"
                  >
                    {messages.importExport.hidePreviewButton}
                  </button>
                ) : (
                  <div className="hidden h-[48px] sm:block" aria-hidden="true" />
                )}
              </div>
              <div className="w-full sm:w-[11.5rem]">
                <button
                  type="button"
                  onClick={openImportConfirmModal}
                  disabled={!importFile || isPreviewingImport || isImportingCsv}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isImportingCsv
                    ? messages.importExport.importing
                    : messages.importExport.importButton}
                </button>
              </div>
            </div>

            {importFormError ? (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {importFormError}
              </div>
            ) : null}

            {importMessage ? (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {importMessage}
              </div>
            ) : null}

            {showImportResults && importSummary ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    {messages.importExport.summaryTitle}
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-[var(--foreground)]">
                    <p>{messages.importExport.summaryTotal.replace("{count}", String(importSummary.totalRows))}</p>
                    <p>{messages.importExport.summaryValid.replace("{count}", String(importSummary.validRows))}</p>
                    <p>{messages.importExport.summaryCategoriesToCreate.replace("{count}", String(importSummary.categoriesToCreate))}</p>
                    <p>{messages.importExport.summarySkipped.replace("{count}", String(importSummary.skippedEmptyRows))}</p>
                    <p>{messages.importExport.summaryImported.replace("{count}", String(importSummary.importedRows))}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    {messages.importExport.previewTitle}
                  </p>
                  <div className="mt-3 space-y-3">
                    {importPreview.length ? (
                      paginatedPreview.map((row) => (
                        <div
                          key={`${row.previewNumber || row.rowNumber}-${row.category}-${row.amount}`}
                          className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-semibold text-[var(--foreground)]">
                              #{row.previewNumber || row.rowNumber} · {row.category}
                            </p>
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                              {getPreviewStatusLabel(row.status)}
                            </span>
                          </div>
                          <p className="mt-1 text-[var(--foreground)]/80">
                            {row.type} · {row.amount} · {row.date}
                          </p>
                          {row.comment ? (
                            <p className="mt-1 text-[var(--muted)]">{row.comment}</p>
                          ) : null}
                          {row.messages?.length ? (
                            <ul className="mt-2 space-y-1 text-xs text-rose-700">
                              {row.messages.map((message) => (
                                <li key={message}>{message}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--muted)]">
                        {messages.importExport.previewEmpty}
                      </p>
                    )}
                    {importPreview.length > previewPageSize ? (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                        <p className="text-sm text-[var(--muted)]">
                          {messages.importExport.previewPage
                            .replace("{current}", String(importPreviewPage))
                            .replace("{total}", String(totalPreviewPages))}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setImportPreviewPage((current) => Math.max(1, current - 1))
                            }
                            disabled={importPreviewPage === 1}
                            className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {messages.importExport.previousPage}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setImportPreviewPage((current) =>
                                Math.min(totalPreviewPages, current + 1)
                              )
                            }
                            disabled={importPreviewPage === totalPreviewPages}
                            className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {messages.importExport.nextPage}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <p className="eyebrow">{messages.importExport.exportEyebrow}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {messages.importExport.exportTitle}
            </h2>
            <p className="muted max-w-2xl text-sm leading-6">
              {messages.importExport.exportDescription}
            </p>
            <p className="text-sm font-medium text-[var(--foreground)]/70">
              {messages.importExport.exportFormatNote}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="w-full sm:w-[11.5rem]">
              <a
                href="/api/export/csv"
                className={`${profileActionButtonClass} bg-[var(--accent)] !text-white transition hover:bg-[var(--accent-strong)] hover:!text-white focus:!text-white visited:!text-white`}
              >
                {messages.importExport.exportButton}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <p className="eyebrow">{messages.common.signOut}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {messages.common.signOutConfirmTitle}
            </h2>
            <p className="muted max-w-2xl text-sm leading-6">
              {messages.common.signOutConfirmDescription}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="w-full sm:w-[11.5rem]">
              <SignOutButton
                action={signOutAction}
                buttonLabel={messages.common.signOut}
                confirmTitle={messages.common.signOutConfirmTitle}
                confirmDescription={messages.common.signOutConfirmDescription}
                cancelLabel={messages.common.signOutConfirmCancel}
                confirmLabel={messages.common.signOutConfirmAction}
                className={`${profileActionButtonClass} w-full`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[1.75rem] border border-rose-200 bg-rose-50/70 p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-3">
            <p className="eyebrow text-rose-700">{messages.profile.dangerEyebrow}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-rose-950">
              {messages.profile.dangerTitle}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-rose-900/80">
              {messages.profile.dangerDescription}
            </p>
            <p className="text-sm font-medium text-rose-800">
              {messages.profile.dangerWarning}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="w-full sm:w-[11.5rem]">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className={`${profileActionButtonClass} bg-rose-600 text-white transition hover:bg-rose-700 hover:shadow-[0_14px_30px_rgba(225,29,72,0.22)]`}
              >
                {messages.profile.dangerButton}
              </button>
            </div>
          </div>
        </div>
      </section>

      {showResetModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8">
          <div className="w-full max-w-lg rounded-[1.75rem] border border-rose-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.24)] sm:p-7">
            <div className="space-y-3">
              <p className="eyebrow text-rose-700">{messages.profile.dangerEyebrow}</p>
              <h3 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {messages.profile.dangerModalTitle}
              </h3>
              <p className="text-sm leading-6 text-[var(--muted)]">
                {messages.profile.dangerModalDescription}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResettingData}
                className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {messages.profile.dangerModalCancel}
              </button>
              <button
                type="button"
                onClick={handleResetAccountData}
                disabled={isResettingData}
                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isResettingData ? messages.profile.clearing : messages.profile.dangerModalConfirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showImportConfirmModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8">
          <div className="w-full max-w-lg rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.24)] sm:p-7">
            <div className="space-y-3">
              <p className="eyebrow">{messages.importExport.importEyebrow}</p>
              <h3 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {messages.importExport.importConfirmTitle}
              </h3>
              <p className="text-sm leading-6 text-[var(--muted)]">
                {messages.importExport.importConfirmDescription}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowImportConfirmModal(false)}
                disabled={isImportingCsv}
                className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {messages.importExport.importConfirmCancel}
              </button>
              <button
                type="button"
                onClick={confirmCsvImport}
                disabled={isImportingCsv}
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isImportingCsv
                  ? messages.importExport.importing
                  : messages.importExport.importConfirmAction}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
