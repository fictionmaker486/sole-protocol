'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// 1. 定義驗證規則 📋
const EvidenceSchema = z.object({
  evidenceLink: z.string().url({ message: "必須提供有效的連結 (如 GitHub PR 或 文件連結)" }),
  note: z.string().max(100, "備註不可超過 100 字").optional(),
})

type EvidenceFormData = z.infer<typeof EvidenceSchema>

// 2. 定義 Props 介面 🗂️
interface SubmitProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionTitle: string;
  missionId: string;    
  userEmail: string;    
  successStreak?: number;
}

export default function SubmitProofModal({ 
  isOpen, 
  onClose, 
  missionTitle, 
  missionId,
  userEmail,
  successStreak = 1 
}: SubmitProofModalProps) {
  
  const supabase = createClient()
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EvidenceFormData>({
    resolver: zodResolver(EvidenceSchema)
  })

  // 3. 提交處理邏輯 🚀
  const onSubmit = async (data: EvidenceFormData) => {
    try {
      // 更新任務狀態為驗證中
      const { error: missionError } = await supabase
        .from('missions')
        .update({ status: 'verifying' })
        .eq('id', missionId);

      if (missionError) throw missionError;

      // 寫入證據資料表
      const { error: evidenceError } = await supabase
        .from('evidences')
        .insert([{
          mission_id: missionId,
          evidence_url: data.evidenceLink,
          note: data.note,
          agent_email: userEmail
        }]);

      if (evidenceError) throw evidenceError;

      onClose();
      router.refresh(); // 重新整理頁面數據
    } catch (error) {
      console.error('STVS_COMMIT_FAILURE:', error);
      alert('系統錯誤：無法完成行為存證。');
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 🌫️ */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* 側邊面板 🛠️ */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-900 p-8 z-[101] shadow-2xl flex flex-col text-white"
          >
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-sm font-bold tracking-tight">{missionTitle}</h2>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                  Status: Re_validating [{successStreak}/3]
                </p>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-600 uppercase">Verification_Link 🔗</label>
                <input 
                  {...register('evidenceLink')}
                  placeholder="https://github.com/..."
                  className="w-full bg-transparent border-b border-zinc-800 py-2 text-sm focus:outline-none focus:border-zinc-400 transition-colors font-mono"
                />
                {errors.evidenceLink && <p className="text-[10px] text-red-500 font-mono mt-1">{errors.evidenceLink.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-600 uppercase">Notes 📝</label>
                <textarea 
                  {...register('note')}
                  rows={4}
                  className="w-full bg-zinc-900/30 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="mt-auto w-full bg-white text-black py-4 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Analyzing...' : 'Commit_Verification'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}