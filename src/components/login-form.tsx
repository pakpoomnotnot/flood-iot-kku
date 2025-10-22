import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Droplets } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          
          {/* Left Side - Form */}
          <form className="p-8 md:p-10">
            <FieldGroup>
              
              {/* Header */}
              <div className="flex flex-col gap-4 text-center mb-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Droplets className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <a href="/" className="text-xl font-bold text-gray-900">KKC-UFM</a>
                    <p className="text-xs text-gray-500">Urban Flood Management</p>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">ยินดีต้อนรับ</h2>
                  <p className="text-sm text-gray-600 mt-1">เข้าสู่ระบบเพื่อใช้งาน</p>
                </div>
              </div>

              {/* Email Field */}
              <Field>
                <FieldLabel htmlFor="email">อีเมล</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                />
              </Field>

              {/* Password Field */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">รหัสผ่าน</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </Field>

              {/* Login Button */}
              <Field>
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  เข้าสู่ระบบ
                </Button>
              </Field>

              {/* Divider */}
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                หรือเข้าสู่ระบบด้วย
              </FieldSeparator>

              {/* Social Login */}
              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Apple</span>
                </Button>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Telegram</span>
                </Button>
              </Field>

              {/* Sign Up Link */}
              <FieldDescription className="text-center">
                ยังไม่มีบัญชี? <a href="#" className="text-blue-600 hover:underline font-medium">สมัครสมาชิก</a>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* Right Side - Image/Info */}
          <div className="relative hidden md:block bg-gradient-to-br from-blue-600 to-cyan-600">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-white">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold">ระบบจัดการน้ำท่วม</h3>
                  <p className="text-blue-100">
                    ติดตามและวิเคราะห์สถานการณ์
                    <br />
                    แบบเรียลไทม์
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
                  <div>
                    <p className="text-2xl font-bold">29</p>
                    <p className="text-xs text-blue-100">สถานี</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-xs text-blue-100">ตลอดเวลา</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">98%</p>
                    <p className="text-xs text-blue-100">แม่นยำ</p>
                  </div>
                </div>

                <div className="pt-6">
                  <p className="text-sm text-blue-100">มหาวิทยาลัยขอนแก่น</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <FieldDescription className="text-center text-sm text-gray-600">
        การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
        <a href="#" className="text-blue-600 hover:underline">เงื่อนไขการใช้งาน</a>
        {" "}และ{" "}
        <a href="#" className="text-blue-600 hover:underline">นโยบายความเป็นส่วนตัว</a>
      </FieldDescription>
    </div>
  )
}