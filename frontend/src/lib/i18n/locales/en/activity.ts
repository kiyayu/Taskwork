//src/lib/i18n/locales/en/activity.ts
export const activity = {
  title: 'Activity',
  description: 'What happened in this project, newest first.',
  empty: 'Nothing has happened yet.',
  loadFailed: 'Could not load the activity.',
  loadMore: 'Load more',
  unknownTask: 'a task',
  type: {
    task_created: '{{actor}} created "{{task}}"',
    task_moved: '{{actor}} moved "{{task}}" to {{list}}',
    task_archived: '{{actor}} archived "{{task}}"',
    task_restored: '{{actor}} restored "{{task}}"',
    task_deleted: '{{actor}} deleted "{{task}}"',
    task_assigned: '{{actor}} assigned "{{task}}" to {{target}}',
    comment_added: '{{actor}} commented on "{{task}}"',
    attachment_added: '{{actor}} attached a file to "{{task}}"',
    member_joined: '{{actor}} joined the project',
    member_removed: '{{actor}} removed {{target}}',
    list_created: '{{actor}} added the list "{{list}}"',
  },
} as const