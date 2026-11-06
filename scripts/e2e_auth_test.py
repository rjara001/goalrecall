import subprocess
import time
import sys
from playwright.sync_api import sync_playwright

def run_e2e():
    print("--- Starting Vite Preview Server ---")
    server = subprocess.Popen(["bun", "run", "preview", "--port", "4173"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(3)

    with sync_playwright() as p:
        print("--- Launching Chromium Browser ---")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))

        try:
            print("Step 1: Navigating to http://localhost:4173 ...")
            page.goto("http://localhost:4173", wait_until="networkidle")

            print("Step 2: Checking for clean state (no default Alex Morgan mock user logged in)...")
            login_btn = page.locator("button:has-text('Sign In'), button:has-text('Iniciar Sesión')").first
            assert login_btn.is_visible(), "Sign in button should be visible in clean unauthenticated state!"
            print("✓ Clean state verified: User is not authenticated by default.")

            print("Step 3: Checking footer version v0.2.1...")
            footers = page.locator("footer").all()
            footer_text = " ".join([f.inner_text() for f in footers])
            assert "v0.2.1" in footer_text, f"Footer does not contain v0.2.1! Text: {footer_text}"
            print("✓ Footer verified: contains v0.2.1 without APP_VERSION errors.")

            print("Step 4: Opening Auth Modal...")
            login_btn.click()
            page.wait_for_timeout(500)

            print("Step 5: Verifying Auth Modal UI & absence of Dev Mode button...")
            modal_content = page.content()
            assert "Dev Mode: Quick Test Login" not in modal_content, "Dev Mode button found in AuthModal!"
            assert "Dev Mode" not in modal_content, "Dev Mode reference found in AuthModal!"
            print("✓ Dev Mode button is absent as expected.")

            # Check Google button
            google_btn = page.locator("button:has-text('Google')")
            assert google_btn.count() > 0, "Google Sign-In button not found in AuthModal!"
            print("✓ Google Sign-In button verified.")

            print("Step 6: Testing User Registration Flow via AuthModal...")
            register_tab = page.locator("button:has-text('Create GoalRecall Account'), button:has-text('Crear cuenta')").first
            register_tab.click()
            page.wait_for_timeout(300)

            modal = page.locator(".fixed.inset-0")
            name_input = modal.locator("input[type='text']").first
            email_input = modal.locator("input[type='email']").first
            username_input = modal.locator("input[type='text']").nth(1)
            passwords = modal.locator("input[type='password']").all()

            name_input.fill("E2E Test User")
            email_input.fill("e2e_tester@example.com")
            username_input.fill("e2etester")
            passwords[0].fill("Password123!")
            passwords[1].fill("Password123!")

            # Click create account
            submit_btn = modal.locator("button[type='submit']").first
            submit_btn.click()
            page.wait_for_timeout(1000)

            # Check local storage for user persistence (captains_user_v1)
            user_in_storage = page.evaluate("() => localStorage.getItem('captains_user_v1')")
            print(f"LocalStorage captains_user_v1: {user_in_storage}")
            assert user_in_storage and "e2e_tester@example.com" in user_in_storage, "User registration did not persist user in session!"
            print("✓ User registration and session persistence verified.")

            # Verify User avatar or initials appears in header
            avatar_btn = page.locator("header button:has-text('E2E')").first
            assert avatar_btn.is_visible(), "User avatar/badge should be visible in navbar!"
            print("✓ Navbar displays authenticated user profile.")

            print("Step 7: Opening User Dropdown & Checking Provider Badge...")
            avatar_btn.click()
            page.wait_for_timeout(500)
            dropdown_content = page.content()
            assert "E2E Test User" in dropdown_content and "e2e_tester@example.com" in dropdown_content
            assert "Local" in dropdown_content  # Since fallback was local
            print("✓ User dropdown correctly displays account details and 'Local' authProvider badge.")

            print("Step 8: Testing Logout Flow...")
            logout_btn = page.locator("button:has-text('Sign Out'), button:has-text('Cerrar sesión')").first
            assert logout_btn.is_visible(), "Sign Out button should be visible in dropdown!"
            logout_btn.click()
            page.wait_for_timeout(500)

            user_after_logout = page.evaluate("() => localStorage.getItem('captains_user_v1')")
            print(f"LocalStorage after logout: {user_after_logout}")
            assert not user_after_logout, "User was not cleared from localStorage after logout!"
            print("✓ Logout successfully cleared the user session.")

            # Sign in button returns
            assert page.locator("button:has-text('Sign In'), button:has-text('Iniciar Sesión')").first.is_visible()
            print("✓ Navbar reverted to unauthenticated state.")

            assert len(errors) == 0, f"Browser encountered errors: {errors}"

            print("\n========================================")
            print("🎉 ALL E2E AUTOMATED TESTS PASSED! 🎉")
            print("========================================\n")
        finally:
            browser.close()
            server.terminate()

if __name__ == "__main__":
    run_e2e()
