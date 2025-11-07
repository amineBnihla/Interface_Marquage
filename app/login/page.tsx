"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Mail, Lock, Eye, EyeOff, Server, RotateCcw } from "lucide-react"
import { Logo } from "@/components/logo"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { loginUser } from "@/api/api"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { api } from "@/api"


const formSchema = z.object({
  username: z.string().min(2).max(50),
  password:z.string()
})
export default function Login() {
  const [email, setEmail] = useState("Admin")
  const [password, setPassword] = useState("Admin")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showHostDialog, setShowHostDialog] = useState(false)
  const [protocol, setProtocol] = useState("http")
  const [hostAddress, setHostAddress] = useState("192.168.1.10")
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password:""
    },
  })
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      
      const {username,password} = values
       // Simulate login delay
       const res =  await loginUser({username, password})
       if(res.success){
        console.log(res.data)
           router.push('/')
           return
          }
          toast.error(res.message)
          setIsLoading(false)
    } catch (error) {
      toast.error(error?.response?.data?.message || "Une erreur s'est produite lors de la connexion")
          setIsLoading(false)
    }
  }

  const handleHostChange = () => {
    // Handle host change logic here
     console.log(protocol,hostAddress)
    if(!protocol || !hostAddress){
      toast.error("Merci de remplir tous les infos")
      return
    }
    const Host = `${protocol}://${hostAddress}`
    localStorage.setItem("BaseUrl",Host)
    api.defaults.baseURL = Host
    setShowHostDialog(false)
    toast.success("Hôte modifie avec succès")
  }

  const handleHostReset = () => {
    setProtocol("http")
    setHostAddress("192.168.1.10")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-white bg-white">
      <Card className="w-full max-w-md bg-white">
        <CardContent className="p-8 border-transparent">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo variant="login" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Connectez-vous</h1>
            <p className="text-gray-600 text-sm">Content de te revoir ! entrez vos informations de connexion</p>
          </div>

          {/* Form */}
              <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Email Field */}
            <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur</FormLabel>
              <FormControl>
                <div className="relative">
               <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400" />
                <Input   className="pl-10 h-12 border-gray-200 focus:border-[#015571] focus:ring-[#015571] bg-[#F8F8F9]"
 {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          

            {/* Password Field */}
                  <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem >
              <FormLabel className="block text-sm font-medium text-gray-700 mb-2">Mot de pass</FormLabel>
              <FormControl >
                <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400" />

                <Input type={showPassword ? "text" : "password"} className="pl-10 h-12 border-gray-200 focus:border-[#015571] focus:ring-[#015571] bg-[#F8F8F9]"
 {...field} />
  <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full h-12 text-white font-medium bg-[rgba(1,85,113,1)] hover:bg-[#21A8D5] active:bg-[#21A8D5] disabled:!bg-[#E3E8E8] disabled:!text-[#ABBABA] disabled:cursor-not-allowed disabled:hover:!bg-[#E3E8E8]"
            >
              {isLoading ? "Connexion..." : "Connexion"}
            </Button>

            {/* Host Change Button */}
            <Dialog open={showHostDialog} onOpenChange={setShowHostDialog}>
              <CardTitle></CardTitle>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-12 text-[#015571] font-medium border-0 hover:bg-blue-50 hover:text-[#015571] mt-3 bg-transparent"
                >
                  <Server className="h-4 w-4 mr-2 text-[#015571]" />
                  Changement d'hôte
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-xl border-0 p-6">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-center mb-6">
                    <Server className="h-5 w-5 text-[#015571] mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Changement d'hôte</h2>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Protocole et Adresse</label>
                      <div className="flex items-center space-x-2">
                        <Select value={protocol} onValueChange={(val)=>setProtocol(val)}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="http">http</SelectItem>
                            <SelectItem value="https">https</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-gray-500">://</span>
                        <Input
                          value={hostAddress}
                          onChange={(e) => setHostAddress(e.target.value)}
                          placeholder="192.168.1.10"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowHostDialog(false)}
                      className="flex-1 border-orange-400 text-orange-600 bg-transparent hover:bg-orange-50"
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleHostReset}
                      className="flex-1 text-[#015571] hover:bg-transparent border-0 bg-transparent"
                    >
                      <RotateCcw className="h-4 w-4 mr-2 text-[#015571]" />
                      Réinitialiser
                    </Button>
                    <Button onClick={handleHostChange} className="flex-1 bg-[#015571] hover:bg-[#21A8D5] text-white">
                      Modifier
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </form>
             </Form>
          {/* Default Credentials Info */}
        
          {/* <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              <strong>Identifiants par défaut:</strong>
              <br />
              Nom d'utilisateur: Admin
              <br />
              Mot de passe: Admin
            </p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}
