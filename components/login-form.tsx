import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SignInButton } from "@clerk/nextjs"
import { LogInIcon } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 h-100">
          <div className="flex flex-col items-center text-center p-10 justify-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Bem vindo ao Usinas Criativa</h1>
              <p className="text-muted-foreground text-balance">
                Faça login na sua conta
              </p>
            </div>
            <SignInButton>
              <Button
                variant="default"
                className="h-10 gap-2 bg-green-500 text-sm text-white hover:bg-green-600"
              >
                <LogInIcon className="h-4 w-4" />
                Fazer login ou criar conta
              </Button>
            </SignInButton>
          </div>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/logo.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
