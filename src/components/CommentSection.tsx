'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

type Comment = {
  id: number
  content: string
  createdAt: string
  user: {
    id: number
    name: string
    email: string
  }
}

type CommentSectionProps = {
  newsId: number
}

export default function CommentSection({ newsId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComments()
  }, [newsId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/news/comment?newsId=${newsId}`)
      const data = await response.json()
      if (data.success) {
        setComments(data.data.comments)
      }
    } catch (err) {
      console.error('Yorumlar yüklenirken hata oluştu:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/news/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId, content: newComment })
      })

      const data = await response.json()

      if (data.success) {
        setNewComment('')
        await fetchComments()
      } else {
        setError(data.error || 'Yorum gönderilemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-8">
        Yorumlar ({comments.length})
      </h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <div>
          <label htmlFor="comment" className="sr-only">
            Yorum yaz
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            placeholder="Düşüncelerinizi paylaşın..."
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        <div className="mt-3">
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <div className="flex-shrink-0">
                <Image
                  className="h-10 w-10 rounded-full"
                  src={`https://www.gravatar.com/avatar/${Buffer.from(comment.user.email).toString('hex')}?d=identicon&s=40`}
                  alt={comment.user.name}
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900">{comment.user.name}</h3>
                  <span className="text-sm text-gray-500">
                    {format(new Date(comment.createdAt), "d MMM yyyy, HH:mm", { locale: tr })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
