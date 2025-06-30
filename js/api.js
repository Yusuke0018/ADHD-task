// api.js - OpenAI APIとの通信など、外部API連携に関するロジック

import { state, saveAIComment, deleteAIComment, saveApiKey } from './state.js';
import { dateUtils } from './dateUtils.js';

// ===== OpenAI API関連関数 =====
export async function generateAIComment(tasks = null, date = null) {
    if (!state.openaiApiKey) {
        throw new Error('OpenAI APIキーが設定されていません');
    }

    const targetDate = date || state.selectedDate;
    const targetTasks = tasks || state.tasks.filter(task => 
        dateUtils.formatDateToYmd(task.date) === dateUtils.formatDateToYmd(targetDate)
    );

    try {
        const prompt = buildAIPrompt(targetTasks, targetDate);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.openaiApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 200,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API エラー: ${response.status}`);
        }

        const data = await response.json();
        const comment = data.choices[0]?.message?.content?.trim();
        
        if (comment) {
            saveAIComment(comment, targetDate);
            return comment;
        } else {
            throw new Error('AIからの応答を取得できませんでした');
        }
    } catch (error) {
        console.error('AI コメント生成エラー:', error);
        throw error;
    }
}

export function buildAIPrompt(tasks, date) {
    const dateStr = date.toLocaleDateString('ja-JP');
    const completedTasks = tasks.filter(task => task.completed);
    const incompleteTasks = tasks.filter(task => !task.completed);
    
    let prompt = `${dateStr}のタスク管理について、簡潔で前向きなコメントをお願いします。\n\n`;
    
    if (tasks.length === 0) {
        prompt += 'タスクが設定されていません。\n';
    } else {
        if (completedTasks.length > 0) {
            prompt += `完了したタスク（${completedTasks.length}件）:\n`;
            completedTasks.forEach(task => {
                prompt += `- ${task.text}\n`;
            });
        }
        
        if (incompleteTasks.length > 0) {
            prompt += `\n未完了のタスク（${incompleteTasks.length}件）:\n`;
            incompleteTasks.forEach(task => {
                prompt += `- ${task.text}\n`;
            });
        }
    }
    
    prompt += '\n100文字以内で、励ましやアドバイスを含むコメントをください。';
    
    return prompt;
}

// ===== API キー管理 =====
export function setApiKey(apiKey) {
    saveApiKey(apiKey);
}

export function hasApiKey() {
    return !!state.openaiApiKey;
}

export function clearApiKey() {
    saveApiKey(null);
}

// ===== デイリーAIコメント関連 =====
export async function generateDailyAIComment() {
    const dateStr = dateUtils.formatDateToYmd(state.selectedDate);
    
    // ローディング表示
    showAILoading(true);
    
    try {
        const comment = await generateAIComment();
        showDailyAIComment(comment);
        return comment;
    } catch (error) {
        console.error('デイリーAIコメント生成エラー:', error);
        showAIError(error.message);
        throw error;
    } finally {
        showAILoading(false);
    }
}

export function deleteDailyAIComment() {
    deleteAIComment(state.selectedDate);
    hideDailyAIComment();
}

// ===== UI表示制御 =====
function showAILoading(show) {
    const loadingEl = document.getElementById('dailyAILoading');
    const emptyEl = document.getElementById('dailyAIEmpty');
    const contentEl = document.getElementById('dailyAIContent');
    
    if (show) {
        loadingEl?.classList.remove('hidden');
        emptyEl?.classList.add('hidden');
        contentEl?.classList.add('hidden');
    } else {
        loadingEl?.classList.add('hidden');
    }
}

function showDailyAIComment(comment) {
    const textEl = document.getElementById('dailyAIText');
    const contentEl = document.getElementById('dailyAIContent');
    const emptyEl = document.getElementById('dailyAIEmpty');
    
    if (textEl && contentEl && emptyEl) {
        textEl.textContent = comment;
        contentEl.classList.remove('hidden');
        emptyEl.classList.add('hidden');
    }
}

function hideDailyAIComment() {
    const contentEl = document.getElementById('dailyAIContent');
    const emptyEl = document.getElementById('dailyAIEmpty');
    
    if (contentEl && emptyEl) {
        contentEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
    }
}

function showAIError(message) {
    const emptyEl = document.getElementById('dailyAIEmpty');
    if (emptyEl) {
        const button = emptyEl.querySelector('button');
        if (button) {
            button.textContent = `エラー: ${message}`;
            button.disabled = true;
            setTimeout(() => {
                button.textContent = 'デイリーコメントを生成';
                button.disabled = false;
            }, 3000);
        }
    }
}

// ===== プロンプト設定管理（将来の拡張用） =====
export const promptTemplates = {
    daily: {
        name: 'デイリーコメント',
        template: buildAIPrompt
    },
    weekly: {
        name: 'ウィークリー振り返り',
        template: (tasks, date) => {
            // 週次振り返り用のプロンプト（将来実装）
            return 'ウィークリー振り返りプロンプト';
        }
    },
    motivational: {
        name: 'モチベーション向上',
        template: (tasks, date) => {
            // モチベーション向上用のプロンプト（将来実装）
            return 'モチベーション向上プロンプト';
        }
    }
};