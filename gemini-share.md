# ADHD-taskアプリ - タスク先送りボタンの修正

## 修正内容の概要

### 問題
当日のタスクを翌日に移行する「先送り」ボタンが表示されていませんでした。

### 原因
`app.js`の1436行目で、先送りボタンの表示条件に`!isToday`が含まれていたため、今日の日付を表示している時にはボタンが非表示になっていました。

### 修正
条件から`!isToday`を削除し、タスクのステータスが`pending`（未完了）であれば常に先送りボタンを表示するように変更しました。

## 修正したコード

### 変更前（app.js 1436行目付近）:
```javascript
${task.status === 'pending' && !isToday ? `
    <button onclick="app.postponeTask('${task.id}')" class="p-2 text-gray-400 hover:text-gray-600 transition-all" title="翌日へ先送り">
        <svg class="w-4 h-4 mobile-text-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
    </button>` : ''}
```

### 変更後:
```javascript
${task.status === 'pending' ? `
    <button onclick="app.postponeTask('${task.id}')" class="p-2 text-gray-400 hover:text-gray-600 transition-all" title="翌日へ先送り">
        <svg class="w-4 h-4 mobile-text-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
    </button>` : ''}
```

## postponeTask関数の動作（参考）

```javascript
postponeTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    const tomorrow = new Date(this.selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTasks = this.tasks.filter(t => new Date(t.scheduledFor).toDateString() === tomorrow.toDateString() && t.status === 'pending' );
    const normalCount = tomorrowTasks.filter(t => t.type === 'normal').length;
    const urgentCount = tomorrowTasks.filter(t => t.type === 'urgent').length;
    // 通常タスクの制限を解除（コメントアウト）
    // if (task.type === 'normal' && normalCount >= 3) { this.showError('翌日の通常タスクは既に3件です（未完了）'); return; }
    if (task.type === 'urgent' && urgentCount >= 3) { this.showError('翌日の目標タスクは既に3件です（未完了）'); return; }
    task.scheduledFor = tomorrow;
    this.showPostponeEffect();
    setTimeout(() => { this.saveData(); this.render(); }, 600);
}
```

## アプリの改善提案（Geminiへの質問）

1. **UXの改善**
   - 先送りボタンの配置や見た目は適切でしょうか？
   - モバイルでの操作性は問題ないでしょうか？

2. **機能の拡張**
   - 複数日後への先送り機能があると便利でしょうか？
   - 先送り回数の制限や警告機能は必要でしょうか？

3. **ADHD対応の観点**
   - タスクの先送りを防ぐための工夫はありますか？
   - 先送りしたタスクの優先度を自動的に上げるなどの機能は有効でしょうか？

4. **パフォーマンス**
   - 現在のコード構造で問題はありませんか？
   - リファクタリングの余地はありますか？

5. **その他**
   - 二十四節気という日本的な要素とタスク管理の組み合わせについてどう思いますか？
   - 他に追加すべき機能はありますか？

## プロジェクト情報
- リポジトリ: https://github.com/Yusuke0018/ADHD-task
- 技術スタック: HTML, JavaScript, CSS (Tailwind CSS)
- PWA対応済み
- ローカルストレージでデータ管理