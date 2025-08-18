'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/user'
import { HeartIcon, BookmarkIcon, ChatBubbleLeftIcon, UserIcon } from '@heroicons/react/24/outline'

interface UserActivity {
  id: number
  createdAt: string
  type: 'like' | 'save' | 'comment'
  news: {
    id: number
    title: string
    platform: {
      domain: string
      name: string
    }
    publishedAt: string
  }
  user?: {
    id: number
    name: string
    username?: string
    avatarUrl?: string
    oauthProvider?: string
  }
}

interface UserActivityListProps {
  newsId: number
  activityType: 'likes' | 'saves' | 'comments'
}

export default function UserActivityList({ newsId, activityType }: UserActivityListProps) {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [newsId, activityType])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      let endpoint = ''
      
      switch (activityType) {
        case 'likes':
          endpoint = `/api/news/like?newsId=${newsId}`
          break
        case 'saves':
          endpoint = `/api/news/save?newsId=${newsId}`
          break
        case 'comments':
          endpoint = `/api/news/comment?newsId=${newsId}`
          break
      }

      const response = await fetch(endpoint)
      const data = await response.json()

      if (data.success) {
        if (activityType === 'comments') {
          setActivities(data.data.comments || [])
        } else {
          setActivities(data.data.recentLikes || data.data.recentSaves || [])
        }
      } else {
        setError(data.error || 'Aktiviteler yüklenemedi')
      }
    } catch (err) {
      setError('Aktiviteler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <HeartIcon className="h-4 w-4 text-red-500" />
      case 'save':
        return <BookmarkIcon className="h-4 w-4 text-yellow-500" />
      case 'comment':
        return <ChatBubbleLeftIcon className="h-4 w-4 text-blue-500" />
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Az önce'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dk önce`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} sa önce`
    return `${Math.floor(diffInSeconds / 86400)} gün önce`
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2 mt-1"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">
          {activityType === 'likes' && 'Henüz beğeni yok'}
          {activityType === 'saves' && 'Henüz kayıt yok'}
          {activityType === 'comments' && 'Henüz yorum yok'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-3">
          {/* User Avatar */}
          <div className="relative">
            {activity.user?.avatarUrl ? (
              <img
                src={activity.user.avatarUrl}
                alt={activity.user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-gray-500" />
              </div>
            )}
            {activity.user?.oauthProvider && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            )}
          </div>

          {/* Activity Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {getActivityIcon(activity.type)}
              <p className="text-sm text-gray-900 truncate">
                <span className="font-medium">
                  {activity.user?.username ? `@${activity.user.username}` : activity.user?.name}
                </span>
                {activityType === 'likes' && ' beğendi'}
                {activityType === 'saves' && ' kaydetti'}
                {activityType === 'comments' && ' yorum yaptı'}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {formatTimeAgo(activity.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
