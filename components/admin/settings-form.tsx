'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface SettingsFormProps {
  settings: Record<string, string>
  userEmail: string
}

export function SettingsForm({ settings, userEmail }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Site settings state
  const [siteName, setSiteName] = useState(settings.site_name || 'debisi designs')
  const [siteDescription, setSiteDescription] = useState(settings.site_description || '')
  const [contactEmail, setContactEmail] = useState(settings.contact_email || '')
  const [socialInstagram, setSocialInstagram] = useState(settings.social_instagram || '')
  const [socialLinkedin, setSocialLinkedin] = useState(settings.social_linkedin || '')
  const [socialTwitter, setSocialTwitter] = useState(settings.social_twitter || '')

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    try {
      const settingsToSave = [
        { key: 'site_name', value: siteName },
        { key: 'site_description', value: siteDescription },
        { key: 'contact_email', value: contactEmail },
        { key: 'social_instagram', value: socialInstagram },
        { key: 'social_linkedin', value: socialLinkedin },
        { key: 'social_twitter', value: socialTwitter },
      ]

      for (const setting of settingsToSave) {
        await supabase
          .from('site_settings')
          .upsert(
            { key: setting.key, value: setting.value },
            { onConflict: 'key' }
          )
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      router.refresh()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {message && (
        <div className={`px-4 py-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bricolage">Account</CardTitle>
          <CardDescription>Your admin account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={userEmail} disabled className="bg-gray-50" />
            <p className="text-xs text-black-100/60">
              Contact support to change your email address
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Site Settings */}
      <form onSubmit={handleSaveSettings}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bricolage">Site Settings</CardTitle>
            <CardDescription>General site configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="debisi designs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                placeholder="Full-Service Design Agency"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="hello@debisidesigns.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-bricolage">Social Media</CardTitle>
            <CardDescription>Your social media profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">
                <i className="ri-instagram-line mr-2"></i>
                Instagram
              </Label>
              <Input
                id="instagram"
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
                placeholder="https://instagram.com/debisidesigns"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">
                <i className="ri-linkedin-line mr-2"></i>
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={socialLinkedin}
                onChange={(e) => setSocialLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/debisidesigns"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">
                <i className="ri-twitter-x-line mr-2"></i>
                Twitter/X
              </Label>
              <Input
                id="twitter"
                value={socialTwitter}
                onChange={(e) => setSocialTwitter(e.target.value)}
                placeholder="https://twitter.com/debisidesigns"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button 
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
