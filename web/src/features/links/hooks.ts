import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLink, deleteLink, exportLinksCsv, incrementAccess, listLinks, resolveLink } from "./api";

export function useLinksQuery() {
  return useQuery({
    queryKey: ["links"],
    queryFn: listLinks,
  });
}

export function useCreateLinkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLink,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}

export function useDeleteLinkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLink,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}

export function useResolveLinkMutation() {
  return useMutation({
    mutationFn: resolveLink,
  });
}

export function useIncrementAccessMutation() {
  return useMutation({
    mutationFn: incrementAccess,
  });
}

export function useExportLinksCsvMutation() {
  return useMutation({
    mutationFn: exportLinksCsv,
  });
}
