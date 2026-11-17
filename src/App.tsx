import React, { useCallback } from "react";
import { Check, Info, AlertTriangle, Lock } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { TimelineView } from "./components/TimelineView";
import { InboxView } from "./components/InboxView";
import { DocumentationView } from "./components/DocumentationView";
import { PublicDeck } from "./components/PublicDeck";
import { FeaturesView } from "./components/FeaturesView";
import { OffersView } from "./components/OffersView";
import { AppModals } from "./components/AppModals";
import { AppFooter } from "./components/AppFooter";
import { INITIAL_USER } from "./utils/storage";
import { useI18n } from "./i18n";
import { APP_VERSION as FALLBACK_APP_VERSION } from "./constants/version";
import { useToast } from "./hooks/useToast";
import { ActiveView, useAppRouting } from "./hooks/useAppRouting";
import { useAppModals } from "./hooks/useAppModals";
import { useWorkspaceData } from "./hooks/useWorkspaceData";

export type { ActiveView };

declare const APP_VERSION: string | undefined;
const currentAppVersion = typeof APP_VERSION !== "undefined" ? APP_VERSION : FALLBACK_APP_VERSION;

export default function App() {
  const { t } = useI18n();
  const { toast, showToast } = useToast();
  const routing = useAppRouting();
  const modals = useAppModals();

  const handleAuthenticatedNavigate = useCallback(() => {
    routing.setActiveView("quarters");
  }, [routing.setActiveView]);

  const handleLoggedOutNavigate = useCallback(() => {
    routing.setActiveView("landing");
    routing.setActiveQuartersTab("timeline");
    modals.resetAllModals();
  }, [routing.setActiveView, routing.setActiveQuartersTab, modals.resetAllModals]);

  const workspace = useWorkspaceData({
    showToast,
    onAuthenticatedNavigate: handleAuthenticatedNavigate,
    onLoggedOutNavigate: handleLoggedOutNavigate,
  });

  const handleGoToQuartersTimeline = () => {
    if (!workspace.user) {
      modals.setIsAuthOpen(true);
    } else {
      routing.handleNavigateView("quarters");
      routing.setActiveQuartersTab("timeline");
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar
        activeView={routing.activeView}
        setActiveView={(v) => {
          routing.setUsernameLookupError(null);
          routing.handleNavigateView(v);
        }}
        activeQuartersTab={routing.activeQuartersTab}
        setActiveQuartersTab={routing.setActiveQuartersTab}
        onOpenQuickLog={() => {
          modals.setEditingLog(null);
          modals.setIsQuickLogOpen(true);
        }}
        onOpenCvUpload={() => modals.setIsCvUploadOpen(true)}
        onOpenAuth={() => modals.setIsAuthOpen(true)}
        onOpenSettings={() => modals.setIsSettingsOpen(true)}
        onOpenShareModal={() => modals.setIsShareModalOpen(true)}
        onOpenAvatarModal={() => modals.setIsAvatarModalOpen(true)}
        onLogout={workspace.handleLogout}
        user={workspace.user}
        unreadInboxCount={workspace.unreadInboxCount}
        publicLogsCount={workspace.publicLogsCount}
      />

      <main
        className={`flex-1 w-full mx-auto ${
          routing.activeView === "features" || routing.activeView === "docs"
            ? "px-0 py-0 max-w-none"
            : "max-w-7xl px-4 lg:px-8 py-6"
        }`}
      >
        {routing.activeView === "landing" && (
          <LandingPage
            onOpenAuth={() => modals.setIsAuthOpen(true)}
            onEnterQuarters={handleGoToQuartersTimeline}
            onEnterPublicDeck={() => routing.handleNavigateView("public")}
            onOpenDocs={() => routing.handleNavigateView("docs")}
            onOpenQuickLog={() => {
              modals.setEditingLog(null);
              modals.setIsQuickLogOpen(true);
            }}
            onOpenFeatures={() => routing.handleNavigateView("features")}
            user={workspace.user}
            logsCount={workspace.logs.length}
          />
        )}

        {routing.activeView === "quarters" &&
          (!workspace.user ? (
            <div className="py-20 text-center max-w-md mx-auto space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{t.app.privateSpaceProtected}</h3>
                <p className="text-slate-400 text-sm">{t.app.privateSpaceDesc}</p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => modals.setIsAuthOpen(true)}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  {t.app.signInToAccess}
                </button>
                <button
                  onClick={() => routing.handleNavigateView("landing")}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                >
                  {t.app.backToHome}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {routing.activeQuartersTab === "timeline" && (
                <TimelineView
                  logs={workspace.logs}
                  experiences={workspace.experiences}
                  products={workspace.products}
                  certifications={workspace.certifications}
                  careerGoals={workspace.careerGoals}
                  onTogglePublic={workspace.handleTogglePublic}
                  onEditLog={modals.openEditLog}
                  onDeleteLog={workspace.handleDeleteLog}
                  onDuplicateLog={workspace.handleDuplicateLog}
                  onOpenQuickLog={() => modals.openQuickLog()}
                  onOpenPasteBullets={() => modals.setIsPasteBulletsOpen(true)}
                  onOpenCvUpload={() => modals.setIsCvUploadOpen(true)}
                  onAddExperience={modals.openAddExperience}
                  onEditExperience={modals.openEditExperience}
                  onDeleteExperience={workspace.handleDeleteExperience}
                  onAddLogToExperience={(expId) => modals.openQuickLog(expId)}
                  onExtractBulletToLog={workspace.handleExtractBulletToLog}
                  onExtractAllBulletsForExperience={workspace.handleExtractAllBulletsForExperience}
                  onOpenNewProduct={modals.openNewProduct}
                  onEditProduct={modals.openEditProduct}
                  onDeleteProduct={workspace.handleDeleteProduct}
                  onToggleProductPublic={workspace.handleToggleProductPublic}
                  onOpenNewCertification={() => modals.openNewCertification()}
                  onEditCertification={modals.openEditCertification}
                  onDeleteCertification={workspace.handleDeleteCertification}
                  onToggleCertificationPublic={workspace.handleToggleCertificationPublic}
                  onOpenNewCareerGoal={modals.openNewCareerGoal}
                  onEditCareerGoal={modals.openEditCareerGoal}
                  onDeleteCareerGoal={workspace.handleDeleteCareerGoal}
                  onSetCareerGoalStatus={workspace.handleSetCareerGoalStatus}
                  onToggleCareerGoalActionItem={workspace.handleToggleCareerGoalActionItem}
                  onConvertGoalToCertification={(goal) =>
                    modals.openNewCertification({
                      name: goal.title,
                      issueDate:
                        goal.achievedDate?.substring(0, 7) ||
                        new Date().toISOString().substring(0, 7),
                      summary: goal.whyImportant || goal.notes,
                      sourceGoalId: goal.id,
                    })
                  }
                  onConvertGoalToLog={(goal) =>
                    modals.openQuickLog(
                      undefined,
                      `${goal.title}${goal.whyImportant ? ` — ${goal.whyImportant}` : ""}`
                    )
                  }
                />
              )}

              {routing.activeQuartersTab === "inbox" && (
                <InboxView
                  messages={workspace.inbox}
                  userProfile={workspace.user}
                  onMarkRead={workspace.handleMarkMessageRead}
                  onDeleteMessage={workspace.handleDeleteMessage}
                  onIngestSuggestions={workspace.handleIngestIntegrationSuggestions}
                  onConvertSuggestionToLog={(msg) =>
                    modals.openQuickLog(undefined, undefined, {
                      draft: msg.achievementDraft,
                      sourceInboxId: msg.id,
                    })
                  }
                  onQuickSaveSuggestion={workspace.handleQuickConvertInboxSuggestion}
                />
              )}

              {routing.activeQuartersTab === "docs" && (
                <DocumentationView
                  onOpenQuickLog={() => modals.openQuickLog()}
                  onGoToTimeline={() => routing.setActiveQuartersTab("timeline")}
                  onGoToPublicDeck={() => routing.handleNavigateView("public")}
                  onBackToLanding={() => routing.handleNavigateView("landing")}
                  onOpenAuth={() => modals.setIsAuthOpen(true)}
                  onOpenCvUpload={() => modals.setIsCvUploadOpen(true)}
                  user={workspace.user}
                />
              )}

              {routing.activeQuartersTab === "offers" && (
                <OffersView
                  offers={workspace.jobOffers}
                  logs={workspace.logs}
                  experiences={workspace.experiences}
                  user={workspace.user}
                  onSaveOffer={workspace.handleSaveJobOffer}
                  onAddOffer={workspace.handleAddJobOffer}
                  onDeleteOffer={workspace.handleDeleteJobOffer}
                  onOpenQuickLog={() => modals.openQuickLog()}
                  onOpenCvUpload={() => modals.setIsCvUploadOpen(true)}
                />
              )}
            </div>
          ))}

        {routing.activeView === "public" &&
          (routing.isLoadingPublicUser ? (
            <div className="py-24 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
                <span className="text-xl font-bold font-mono">/u/</span>
              </div>
              <h3 className="text-base font-bold text-white">Cargando vitrina pública...</h3>
              <p className="text-xs text-slate-400">
                Verificando logros y credenciales técnicas del usuario.
              </p>
            </div>
          ) : routing.usernameLookupError ? (
            <div className="py-20 text-center max-w-md mx-auto space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Vitrina No Encontrada</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {routing.usernameLookupError} Es posible que el enlace no esté escrito correctamente
                  o que el usuario aún no haya publicado contenido.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    routing.setUsernameLookupError(null);
                    routing.handleNavigateView("landing");
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  Ir al Inicio
                </button>
                {workspace.user ? (
                  <button
                    onClick={() => {
                      routing.setUsernameLookupError(null);
                      routing.handleNavigateView("quarters");
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                  >
                    Ir a Mi Bitácora
                  </button>
                ) : (
                  <button
                    onClick={() => modals.setIsAuthOpen(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                  >
                    Iniciar Sesión
                  </button>
                )}
              </div>
            </div>
          ) : (
            <PublicDeck
              logs={routing.sharedDeck ? routing.sharedDeck.logs : workspace.logs}
              products={routing.sharedDeck ? routing.sharedDeck.products : workspace.products}
              certifications={
                routing.sharedDeck
                  ? routing.sharedDeck.certifications || []
                  : workspace.certifications
              }
              userProfile={
                routing.sharedDeck ? routing.sharedDeck.userProfile : workspace.user || INITIAL_USER
              }
              onSendVisitorMessage={workspace.handleSendVisitorMessage}
              onBackToLanding={routing.clearSharedDeckAndGoHome}
              onOpenAuth={() => modals.setIsAuthOpen(true)}
              isVisitorPreview={Boolean(routing.sharedDeck || !workspace.user)}
              isOwner={Boolean(
                !routing.sharedDeck && workspace.user && !workspace.user.isDemoUser
              )}
              onOpenNewProduct={modals.openNewProduct}
              onEditProduct={modals.openEditProduct}
              onDeleteProduct={workspace.handleDeleteProduct}
              onToggleProductPublic={workspace.handleToggleProductPublic}
              onOpenNewCertification={() => modals.openNewCertification()}
              onEditCertification={modals.openEditCertification}
              onDeleteCertification={workspace.handleDeleteCertification}
              onToggleCertificationPublic={workspace.handleToggleCertificationPublic}
            />
          ))}

        {routing.activeView === "features" && (
          <FeaturesView
            onBackToLanding={() => routing.handleNavigateView("landing")}
            onGoToQuarters={handleGoToQuartersTimeline}
            onOpenQuickLog={() => {
              modals.setEditingLog(null);
              modals.setIsQuickLogOpen(true);
            }}
            onOpenAuth={() => modals.setIsAuthOpen(true)}
            user={workspace.user}
          />
        )}

        {routing.activeView === "docs" && (
          <DocumentationView
            onOpenQuickLog={() => modals.openQuickLog()}
            onGoToTimeline={handleGoToQuartersTimeline}
            onGoToPublicDeck={() => routing.handleNavigateView("public")}
            onBackToLanding={() => routing.handleNavigateView("landing")}
            onOpenAuth={() => modals.setIsAuthOpen(true)}
            onOpenCvUpload={() => modals.setIsCvUploadOpen(true)}
            user={workspace.user}
          />
        )}

        {routing.activeView === "offers" && (
          <OffersView
            offers={workspace.jobOffers}
            logs={workspace.logs}
            experiences={workspace.experiences}
            user={workspace.user}
            onSaveOffer={workspace.handleSaveJobOffer}
            onAddOffer={workspace.handleAddJobOffer}
            onDeleteOffer={workspace.handleDeleteJobOffer}
            onOpenQuickLog={() => modals.openQuickLog()}
            onOpenCvUpload={() => modals.setIsCvUploadOpen(true)}
          />
        )}
      </main>

      <AppModals
        user={workspace.user}
        logs={workspace.logs}
        products={workspace.products}
        certifications={workspace.certifications}
        isQuickLogOpen={modals.isQuickLogOpen}
        editingLog={modals.editingLog}
        initialExperienceIdForLog={modals.initialExperienceIdForLog}
        initialBulletTextForLog={modals.initialBulletTextForLog}
        initialDraftForLog={modals.initialDraftForLog}
        onCloseQuickLog={modals.closeQuickLog}
        onSaveLog={(entryData) => {
          if (
            workspace.handleSaveLog(
              entryData,
              modals.editingLog,
              modals.sourceInboxMessageIdForLog
            )
          ) {
            modals.setEditingLog(null);
          }
        }}
        isExperienceModalOpen={modals.isExperienceModalOpen}
        editingExperience={modals.editingExperience}
        onCloseExperienceModal={modals.closeExperienceModal}
        onSaveExperience={(expData, newLogBulletsToCreate) => {
          workspace.handleSaveExperience(expData, newLogBulletsToCreate);
          modals.closeExperienceModal();
        }}
        isCvUploadOpen={modals.isCvUploadOpen}
        onCloseCvUpload={() => modals.setIsCvUploadOpen(false)}
        onImportBatchLogs={workspace.handleImportBatchLogs}
        onExperiencesUpdated={workspace.setExperiences}
        onUpdateProfile={workspace.handleUpdateProfile}
        isPasteBulletsOpen={modals.isPasteBulletsOpen}
        onClosePasteBullets={() => modals.setIsPasteBulletsOpen(false)}
        onOpenCvModal={() => modals.setIsCvUploadOpen(true)}
        isAuthOpen={modals.isAuthOpen}
        onCloseAuth={() => modals.setIsAuthOpen(false)}
        onLogin={workspace.handleLogin}
        onLogout={workspace.handleLogout}
        onOpenAvatarModal={() => modals.setIsAvatarModalOpen(true)}
        onLoginDev={() => {
          workspace.handleLoginDev();
          modals.setIsAuthOpen(false);
        }}
        isSettingsOpen={modals.isSettingsOpen}
        onCloseSettings={() => modals.setIsSettingsOpen(false)}
        onDataChanged={workspace.reloadDataFromStorage}
        isAvatarModalOpen={modals.isAvatarModalOpen}
        onCloseAvatarModal={() => modals.setIsAvatarModalOpen(false)}
        onSaveAvatar={workspace.handleUpdateAvatar}
        isShareModalOpen={modals.isShareModalOpen}
        onCloseShareModal={() => modals.setIsShareModalOpen(false)}
        isProductModalOpen={modals.isProductModalOpen}
        editingProduct={modals.editingProduct}
        onCloseProductModal={modals.closeProductModal}
        onSaveProduct={(productData) =>
          workspace.handleSaveProduct(productData, Boolean(modals.editingProduct))
        }
        isCertificationModalOpen={modals.isCertificationModalOpen}
        editingCertification={modals.editingCertification}
        certificationPrefill={modals.certificationPrefill}
        onCloseCertificationModal={modals.closeCertificationModal}
        onSaveCertification={(certData, sourceGoalId) =>
          workspace.handleSaveCertification(
            certData,
            Boolean(modals.editingCertification),
            sourceGoalId
          )
        }
        isCareerGoalModalOpen={modals.isCareerGoalModalOpen}
        editingCareerGoal={modals.editingCareerGoal}
        onCloseCareerGoalModal={modals.closeCareerGoalModal}
        onSaveCareerGoal={(goalData) =>
          workspace.handleSaveCareerGoal(goalData, Boolean(modals.editingCareerGoal))
        }
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
          {toast.type === "success" && <Check className="w-4 h-4 text-emerald-400" />}
          {toast.type === "info" && <Info className="w-4 h-4 text-cyan-400" />}
          {toast.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          <span className="text-xs font-medium text-slate-100">{toast.message}</span>
        </div>
      )}

      <AppFooter
        appVersion={currentAppVersion}
        user={workspace.user}
        onNavigateView={routing.handleNavigateView}
        onOpenAuth={() => modals.setIsAuthOpen(true)}
        onOpenSettings={() => modals.setIsSettingsOpen(true)}
        onSelectQuartersTab={routing.setActiveQuartersTab}
      />
    </div>
  );
}
