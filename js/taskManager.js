// taskManager.js - タスク（通常タスク、目標タスク）の追加、完了、編集、削除といった、タスクそのものの操作ロジック

import { state, saveData, addPoints } from './state.js';
import { dateUtils } from './dateUtils.js';

// ===== タスク操作関数 =====
export function addTask(text, type = null) {
    if (!text.trim()) return false;
    
    const taskType = type || state.taskType;
    const newTask = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        type: taskType,
        date: new Date(state.selectedDate),
        addedAt: new Date(),
        points: taskType === 'urgent' ? 0 : 1
    };
    
    state.tasks.push(newTask);
    saveData();
    return newTask;
}

export function toggleTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return false;
    
    if (task.type === 'urgent' && !task.completed) {
        // 目標タスクの場合は完了モーダルを表示
        return { requiresModal: true, task };
    } else {
        // 通常タスクの場合は即座に切り替え
        task.completed = !task.completed;
        
        if (task.completed) {
            // タスク完了時のポイント付与
            const points = task.points || 1;
            addPoints(points, task.date);
        } else {
            // タスク未完了時のポイント減算
            const points = task.points || 1;
            addPoints(-points, task.date);
        }
        
        saveData();
        return { requiresModal: false, task };
    }
}

export function completeTask(taskId, points = null, projectData = null) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return false;
    
    task.completed = true;
    
    // ポイント設定
    if (points !== null) {
        task.points = points;
    } else if (!task.points) {
        task.points = task.type === 'urgent' ? 2 : 1;
    }
    
    // ポイント付与
    addPoints(task.points, task.date);
    
    // プロジェクトポイント処理（将来実装）
    if (projectData) {
        handleProjectPoints(projectData);
    }
    
    saveData();
    return task;
}

export function postponeTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return false;
    
    // 翌日に移動
    const tomorrow = new Date(task.date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    task.date = tomorrow;
    
    saveData();
    return task;
}

export function deleteTask(taskId) {
    const taskIndex = state.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;
    
    const task = state.tasks[taskIndex];
    
    // 完了済みタスクの場合はポイントを減算
    if (task.completed) {
        const points = task.points || 1;
        addPoints(-points, task.date);
    }
    
    state.tasks.splice(taskIndex, 1);
    saveData();
    return task;
}

export function editTask(taskId, newText) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || !newText.trim()) return false;
    
    task.text = newText.trim();
    saveData();
    return task;
}

// ===== タスク取得関数 =====
export function getTasksForDate(date = null) {
    const targetDate = date || state.selectedDate;
    const dateStr = dateUtils.formatDateToYmd(targetDate);
    
    return state.tasks.filter(task => 
        dateUtils.formatDateToYmd(task.date) === dateStr
    );
}

export function getTasksByType(type, date = null) {
    const tasksForDate = getTasksForDate(date);
    return tasksForDate.filter(task => task.type === type);
}

export function getCompletedTasks(date = null) {
    const tasksForDate = getTasksForDate(date);
    return tasksForDate.filter(task => task.completed);
}

export function getIncompleteTasks(date = null) {
    const tasksForDate = getTasksForDate(date);
    return tasksForDate.filter(task => !task.completed);
}

// ===== タスク統計関数 =====
export function getTaskStats(date = null) {
    const tasksForDate = getTasksForDate(date);
    const completed = tasksForDate.filter(task => task.completed);
    const total = tasksForDate.length;
    const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    
    const totalPoints = completed.reduce((sum, task) => sum + (task.points || 1), 0);
    
    return {
        total,
        completed: completed.length,
        incomplete: total - completed.length,
        completionRate,
        totalPoints
    };
}

// ===== タスク検索・フィルタ関数 =====
export function searchTasks(query, dateRange = null) {
    let tasks = state.tasks;
    
    // 日付範囲でフィルタ
    if (dateRange) {
        const { startDate, endDate } = dateRange;
        tasks = tasks.filter(task => 
            task.date >= startDate && task.date <= endDate
        );
    }
    
    // テキスト検索
    if (query.trim()) {
        const searchQuery = query.toLowerCase();
        tasks = tasks.filter(task => 
            task.text.toLowerCase().includes(searchQuery)
        );
    }
    
    return tasks;
}

export function getTasksByDateRange(startDate, endDate) {
    return state.tasks.filter(task => 
        task.date >= startDate && task.date <= endDate
    );
}

// ===== タスクの一括操作 =====
export function completeAllTasks(date = null) {
    const tasksForDate = getTasksForDate(date);
    const incompleteTasks = tasksForDate.filter(task => !task.completed);
    
    incompleteTasks.forEach(task => {
        task.completed = true;
        if (!task.points) {
            task.points = task.type === 'urgent' ? 2 : 1;
        }
        addPoints(task.points, task.date);
    });
    
    saveData();
    return incompleteTasks.length;
}

export function deleteCompletedTasks(date = null) {
    const tasksForDate = getTasksForDate(date);
    const completedTasks = tasksForDate.filter(task => task.completed);
    
    completedTasks.forEach(task => {
        const taskIndex = state.tasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
            // ポイントは既に付与済みなので減算しない
            state.tasks.splice(taskIndex, 1);
        }
    });
    
    saveData();
    return completedTasks.length;
}

// ===== プロジェクト関連処理（将来実装用） =====
function handleProjectPoints(projectData) {
    // プロジェクトポイント処理のプレースホルダー
    // 将来的にprojects.jsと連携して実装
    console.log('Project points handling:', projectData);
}

// ===== タスクのバックアップ・復元 =====
export function backupTasks() {
    return JSON.stringify(state.tasks);
}

export function restoreTasks(backupData) {
    try {
        const tasks = JSON.parse(backupData);
        state.tasks = tasks.map(task => ({
            ...task,
            date: new Date(task.date),
            addedAt: task.addedAt ? new Date(task.addedAt) : new Date()
        }));
        saveData();
        return true;
    } catch (error) {
        console.error('タスクの復元に失敗しました:', error);
        return false;
    }
}

// ===== タスクのバリデーション =====
export function validateTask(task) {
    const errors = [];
    
    if (!task.text || !task.text.trim()) {
        errors.push('タスクのテキストが必要です');
    }
    
    if (!task.date || isNaN(new Date(task.date).getTime())) {
        errors.push('有効な日付が必要です');
    }
    
    if (!['normal', 'urgent'].includes(task.type)) {
        errors.push('タスクタイプは normal または urgent である必要があります');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}