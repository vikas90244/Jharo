import { retreiveResource, RetreiveResourcePayload, retreiveResourceRange } from "@/lib/feature/library"
import { useQuery } from "@tanstack/react-query"

export function useGetResource(id:number){
    return useQuery({
        queryKey:["resource"], 
        queryFn: ()=> retreiveResource(id),
        retry:false,
        staleTime: 5 * 60 * 1000,
    })
}

export function useGetResourceRange(rrPayload:RetreiveResourcePayload){
    return useQuery({
        queryKey:[`page-${rrPayload.id}-start-${rrPayload.start}-end-${rrPayload.end}`],
        queryFn: () => retreiveResourceRange(rrPayload),
        retry:false
    })
}