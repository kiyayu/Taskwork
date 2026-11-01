//src/features/projects/hooks/useProjects.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../api/project.api'

export const projectKeys = {
  all: ['projects'] as const,
  list: ['projects', 'list'] as const,
}

export const useProjects = () =>
  useQuery({ queryKey: projectKeys.list, queryFn: projectApi.list })

// Data work lives in the hooks: every mutation refreshes the whole projects prefix.
export const useCreateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export const useRenameProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectApi.rename,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectApi.remove,
    // onSettled: a 404 (already deleted elsewhere) must still re-sync the list
    onSettled: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export const useProject = (id: string) =>
  useQuery({
    queryKey: ['projects', 'detail', id] as const, // starts with 'projects', so mutations still invalidate it
    queryFn: () => projectApi.get(id),
    enabled: !!id,
  })