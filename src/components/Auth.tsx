import { Auth as SupabaseAuth } from '@supabase/auth-ui-react'
import { supabase } from '@/lib/supabaseClient'
import { useTheme } from 'next-themes';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Button } from '@/components/ui/button';

const Auth = ({ onContinueAsGuest }: { onContinueAsGuest: () => void }) => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="AMC Math Mastery Logo" className="w-20 h-20 mx-auto mb-4"/>
          <h1 className="text-3xl font-bold text-primary">Welcome</h1>
          <p className="text-muted-foreground">Sign in or continue as a guest to track your progress</p>
        </div>
        <div className="glass p-8 rounded-2xl shadow-xl">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                    brandButtonText: 'hsl(var(--primary-foreground))',
                    defaultButtonBackground: 'hsl(var(--muted))',
                    defaultButtonBackgroundHover: 'hsl(var(--muted-foreground))',
                    defaultButtonBorder: 'hsl(var(--border))',
                    defaultButtonText: 'hsl(var(--foreground))',
                    dividerBackground: 'hsl(var(--border))',
                    inputBackground: 'hsl(var(--input))',
                    inputBorder: 'hsl(var(--border))',
                    inputBorderHover: 'hsl(var(--primary))',
                    inputBorderFocus: 'hsl(var(--primary))',
                    inputText: 'hsl(var(--foreground))',
                    inputLabelText: 'hsl(var(--muted-foreground))',
                    inputPlaceholder: 'hsl(var(--muted-foreground))',
                    messageText: 'hsl(var(--foreground))',
                    messageTextDanger: 'hsl(var(--destructive))',
                    anchorTextColor: 'hsl(var(--primary))',
                    anchorTextHoverColor: 'hsl(var(--primary-foreground))',
                  },
                  space: {
                    spaceSmall: '4px',
                    spaceMedium: '8px',
                    spaceLarge: '16px',
                    labelBottomMargin: '8px',
                    anchorBottomMargin: '4px',
                    emailInputSpacing: '8px',
                    socialAuthSpacing: '8px',
                    buttonPadding: '10px 15px',
                    inputPadding: '10px 15px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '14px',
                    baseButtonSize: '14px',
                  },
                  fonts: {
                    bodyFontFamily: `inherit`,
                    buttonFontFamily: `inherit`,
                    inputFontFamily: `inherit`,
                    labelFontFamily: `inherit`,
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: 'var(--radius)',
                    buttonBorderRadius: 'var(--radius)',
                    inputBorderRadius: 'var(--radius)',
                  },
                },
              },
            }}
            theme={theme}
            providers={['google', 'github']}
            socialLayout="horizontal"
            redirectTo={import.meta.env.VITE_SITE_URL || 'http://localhost:8080'}
          />
        </div>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">OR</span>
          </div>
        </div>
        <div>
          <Button variant="outline" className="w-full" onClick={onContinueAsGuest}>
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Auth
