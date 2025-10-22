"use client";
import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  AlertTriangle, 
  BarChart3, 
  Map, 
  Cloud,
  Waves,
  Shield,
  Zap,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  Award,
  Building2,
  Globe,
  Sparkles,
  ChevronRight,
  Play,
  Database,
  Cpu,
  Activity
} from 'lucide-react';
import Link from 'next/link';

const BusinessPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* Navigation - Ultra Modern */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo - Professional */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Droplets className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  KKC-UFM
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide">
                  URBAN FLOOD MANAGEMENT SYSTEM
                </p>
              </div>
            </div>

            {/* Desktop Menu - Clean & Professional */}
            <div className="hidden lg:flex items-center space-x-1">
              <a href="#overview" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                ภาพรวม
              </a>
              <a href="#features" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                ความสามารถ
              </a>
              <a href="#technology" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                เทคโนโลยี
              </a>
              <a href="#impact" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                ผลกระทบ
              </a>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <Link 
                href="/login"
                className="ml-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                เข้าสู่ระบบ
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-6 space-y-2">
              <a href="#overview" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-lg transition-all">
                ภาพรวม
              </a>
              <a href="#features" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-lg transition-all">
                ความสามารถ
              </a>
              <a href="#technology" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-lg transition-all">
                เทคโนโลยี
              </a>
              <a href="#impact" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-lg transition-all">
                ผลกระทบ
              </a>
              <Link 
                href="/map"
                className="block w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg text-center"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Premium & Professional */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(226 232 240 / 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">ระบบกำลังทำงาน · 29 สถานีออนไลน์</span>
              </div>
              
              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                  ระบบจัดการ
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 bg-clip-text text-transparent">
                    น้ำท่วมเมือง
                  </span>
                  <br />
                  ด้วย IoT
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                  แพลตฟอร์มติดตามและวิเคราะห์สถานการณ์น้ำท่วมแบบเรียลไทม์ 
                  เพื่อการตัดสินใจที่รวดเร็วและแม่นยำ สำหรับเมืองขอนแก่น
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/map"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-105 transition-all duration-300"
                >
                  เข้าสู่แดชบอร์ด
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
                  <Play className="mr-2 h-5 w-5" />
                  ดูการสาธิต
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">มหาวิทยาลัยขอนแก่น</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">วช. ประจำปี 2568</span>
                </div>
              </div>
            </div>

            {/* Right Content - Advanced map Preview */}
            <div className="relative">
              {/* Floating Card 1 - Main map */}
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">Real-time Monitoring</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white/80 text-xs font-medium">Live</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-500">ระดับน้ำ</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">45%</p>
                      <p className="text-xs text-green-600 font-medium">↓ 12%</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-medium text-gray-500">ปริมาณฝน</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">28mm</p>
                      <p className="text-xs text-red-600 font-medium">↑ 8mm</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-medium text-gray-500">แจ้งเตือน</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                      <p className="text-xs text-amber-600 font-medium">กำลังดำเนินการ</p>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">แนวโน้ม 7 วัน</span>
                      <span className="text-xs text-gray-500">เฉลี่ย 42%</span>
                    </div>
                    <div className="h-24 flex items-end gap-1.5">
                      {[35, 42, 38, 45, 52, 48, 45].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg relative group cursor-pointer transition-all hover:from-blue-700 hover:to-blue-500"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {height}%
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>จ</span>
                      <span>อ</span>
                      <span>พ</span>
                      <span>พฤ</span>
                      <span>ศ</span>
                      <span>ส</span>
                      <span>อา</span>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">24 สถานี · สถานะปกติ</span>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700">3 สถานี · เฝ้าระวัง</span>
                      </div>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 - Small Alert */}
              <div className="absolute -bottom-6 -right-6 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 hidden xl:block">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">แจ้งเตือนใหม่</p>
                    <p className="text-xs text-gray-600 mt-1">บึงแก่นนคร - ระดับน้ำ 85%</p>
                    <p className="text-xs text-gray-500 mt-2">5 นาทีที่แล้ว</p>
                  </div>
                </div>
              </div>

              {/* Floating Card 3 - Small Stat */}
              <div className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 hidden xl:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">อัพเดทล่าสุด</p>
                    <p className="text-sm font-bold text-gray-900">2 นาทีที่แล้ว</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Stats - Premium Look */}
      <section id="overview" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: '29', label: 'สถานีเซนเซอร์', sublabel: 'ครอบคลุมทั่วเมือง', icon: MapPinIcon, color: 'blue' },
              { number: '24/7', label: 'เฝ้าระวังตลอดเวลา', sublabel: 'ไม่มีวันหยุด', icon: Globe, color: 'green' },
              { number: '15', label: 'นาที', sublabel: 'อัพเดทข้อมูล', icon: Zap, color: 'amber' },
              { number: '98%', label: 'ความแม่นยำ', sublabel: 'การคาดการณ์', icon: TrendingUp, color: 'purple' },
            ].map((stat, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl transition-all group-hover:shadow-xl"></div>
                <div className="relative p-6 space-y-3">
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-2`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-gray-900">{stat.number}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">{stat.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.sublabel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Ultra Modern Cards */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4" />
              ความสามารถของระบบ
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              เทคโนโลยีระดับสากล
              <br />
              <span className="text-blue-600">สำหรับชุมชนไทย</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              ออกแบบมาเพื่อตอบโจทย์การจัดการน้ำท่วมในเมืองอย่างมีประสิทธิภาพ
              ด้วยเทคโนโลยี IoT และ AI
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Map,
                title: 'Real-time Mapping',
                description: 'แผนที่แบบไดนามิกแสดงสถานการณ์น้ำท่วมจาก 29 จุดทั่วเมืองขอนแก่น พร้อมข้อมูลเชิงลึกแบบ real-time',
                color: 'blue',
                features: ['Interactive Map', 'Live Updates', 'Historical Data']
              },
              {
                icon: Database,
                title: 'Smart Analytics',
                description: 'วิเคราะห์ข้อมูลด้วย AI เพื่อคาดการณ์แนวโน้มและให้คำแนะนำเชิงกลยุทธ์แก่ผู้บริหาร',
                color: 'green',
                features: ['AI Prediction', 'Trend Analysis', 'Smart Insights']
              },
              {
                icon: AlertTriangle,
                title: 'Early Warning System',
                description: 'ระบบแจ้งเตือนอัจฉริยะส่งการแจ้งเตือนแบบ multi-channel ให้ผู้เกี่ยวข้องทันที',
                color: 'amber',
                features: ['Instant Alerts', 'Multi-channel', 'Customizable']
              },
              {
                icon: Cloud,
                title: 'IoT Sensor Network',
                description: 'เครือข่ายเซนเซอร์ IoT วัดระดับน้ำและปริมาณฝนอัตโนมัติทุก 15 นาที',
                color: 'purple',
                features: ['29 Stations', 'Auto-update', 'High Accuracy']
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'ความปลอดภัยระดับองค์กรด้วย encryption, authentication และ audit trail',
                color: 'red',
                features: ['SSL/TLS', 'Auth System', 'Audit Logs']
              },
              {
                icon: Cpu,
                title: 'API Integration',
                description: 'REST API สำหรับการเชื่อมต่อกับระบบอื่นๆ และการพัฒนาแอปพลิเคชัน',
                color: 'cyan',
                features: ['REST API', 'Webhooks', 'Documentation']
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-500 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-7 w-7 text-${feature.color}-600`} strokeWidth={2} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {feature.features.map((item, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack - Professional */}
      <section id="technology" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, rgb(255 255 255 / 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
              <Cpu className="h-4 w-4" />
              Technology Stack
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              เลือกใช้เทคโนโลยีที่ดีที่สุดเพื่อประสิทธิภาพสูงสุด
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Frontend Stack */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold">Frontend</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Next.js 14', desc: 'React Framework', badge: 'Latest' },
                  { name: 'TypeScript', desc: 'Type Safety', badge: 'ES2023' },
                  { name: 'Tailwind CSS', desc: 'Utility-first CSS', badge: 'v3.4' },
                  { name: 'shadcn/ui', desc: 'Component Library', badge: 'Pro' },
                  { name: 'MapLibre GL', desc: 'Interactive Maps', badge: 'v4.0' },
                  { name: 'Recharts', desc: 'Data Visualization', badge: 'v2.0' },
                ].map((tech, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div>
                      <p className="font-semibold text-white">{tech.name}</p>
                      <p className="text-sm text-gray-400">{tech.desc}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full">
                      {tech.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backend & Infrastructure */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Database className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold">Backend & Infrastructure</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Python', desc: 'Data Processing', badge: '3.11' },
                  { name: 'PostgreSQL', desc: 'Primary Database', badge: 'v16' },
                  { name: 'MongoDB', desc: 'NoSQL Database', badge: 'v7.0' },
                  { name: 'MQTT', desc: 'IoT Protocol', badge: 'v5.0' },
                  { name: 'Redis', desc: 'Caching Layer', badge: 'v7.2' },
                  { name: 'Docker', desc: 'Containerization', badge: 'Latest' },
                ].map((tech, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div>
                      <p className="font-semibold text-white">{tech.name}</p>
                      <p className="text-sm text-gray-400">{tech.desc}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                      {tech.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                <Award className="h-4 w-4" />
                ผลกระทบเชิงบวก
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                สร้างความเปลี่ยนแปลง
                <br />
                ที่สำคัญ
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                ระบบ KKC-UFM ช่วยปกป้องชีวิตและทรัพย์สินของประชาชน 
                ลดความเสียหายจากภัยน้ำท่วม และเพิ่มประสิทธิภาพการบริหารจัดการเมือง
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Users,
                    title: 'ปกป้องประชาชน',
                    description: 'เตือนภัยล่วงหน้าให้ประชาชนมีเวลาเตรียมตัว',
                    stat: '100K+',
                    statLabel: 'ผู้อยู่อาศัย'
                  },
                  {
                    icon: TrendingUp,
                    title: 'ลดความเสียหาย',
                    description: 'ประหยัดงบประมาณในการแก้ไขปัญหา',
                    stat: '40%',
                    statLabel: 'ลดลง'
                  },
                  {
                    icon: Shield,
                    title: 'เพิ่มความมั่นคง',
                    description: 'สร้างความเชื่อมั่นและความปลอดภัย',
                    stat: '24/7',
                    statLabel: 'ตลอดเวลา'
                  },
                ].map((impact, idx) => (
                  <div key={idx} className="flex gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <impact.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">{impact.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{impact.description}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-600">{impact.stat}</span>
                        <span className="text-sm text-gray-500">{impact.statLabel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Stats */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative space-y-6">
                {[
                  { value: '98%', label: 'ความแม่นยำในการคาดการณ์', icon: TrendingUp, color: 'blue' },
                  { value: '< 5min', label: 'เวลาตอบสนองเฉลี่ย', icon: Zap, color: 'amber' },
                  { value: '29', label: 'จุดติดตามทั่วเมือง', icon: MapPinIcon, color: 'green' },
                  { value: '15min', label: 'ความถี่ในการอัพเดท', icon: Activity, color: 'purple' },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                        <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-8">
            <Sparkles className="h-4 w-4" />
            เริ่มต้นใช้งานวันนี้
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            พร้อมสร้างความแตกต่าง
            <br />
            ให้กับเมืองของคุณ?
          </h2>
          
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            เข้าถึงแพลตฟอร์มจัดการน้ำท่วมที่ทันสมัยที่สุด 
            เพื่อปกป้องชุมชนและทรัพย์สินของคุณ
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/map"
              className="group inline-flex items-center justify-center px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all duration-300"
            >
              เข้าสู่แดชบอร์ด
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
            >
              <Mail className="mr-2 h-5 w-5" />
              ติดต่อเรา
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">ไม่ต้องติดตั้ง</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">เริ่มใช้ได้ทันที</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">รองรับภาษาไทย</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Corporate */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
            
            {/* Logo & Description */}
            <div className="col-span-1 md:col-span-5">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Droplets className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">KKC-UFM</h1>
                  <p className="text-xs text-gray-400 font-medium">URBAN FLOOD MANAGEMENT</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                ระบบจัดการน้ำท่วมเมืองอัจฉริยะด้วยเทคโนโลยี IoT 
                สำหรับเมืองขอนแก่นและพื้นที่ใกล้เคียง
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-gray-400">มหาวิทยาลัยขอนแก่น</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-bold text-lg mb-4">เกี่ยวกับ</h3>
              <ul className="space-y-3">
                <li><a href="#overview" className="text-gray-400 hover:text-white transition-colors text-sm">ภาพรวม</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">ความสามารถ</a></li>
                <li><a href="#technology" className="text-gray-400 hover:text-white transition-colors text-sm">เทคโนโลยี</a></li>
                <li><a href="#impact" className="text-gray-400 hover:text-white transition-colors text-sm">ผลกระทบ</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-bold text-lg mb-4">ทรัพยากร</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">เอกสาร</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">API Docs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">คู่มือ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">ช่วยเหลือ</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-1 md:col-span-3">
              <h3 className="font-bold text-lg mb-4">ติดต่อ</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">อีเมล</p>
                    <a href="mailto:contact@kkc-ufm.com" className="text-white hover:text-blue-400 transition-colors">
                      contact@kkc-ufm.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">โทรศัพท์</p>
                    <a href="tel:043-123-4567" className="text-white hover:text-blue-400 transition-colors">
                      043-123-4567
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 KKC-UFM. All rights reserved. มหาวิทยาลัยขอนแก่น
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  นโยบายความเป็นส่วนตัว
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  เงื่อนไขการใช้งาน
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default BusinessPage;