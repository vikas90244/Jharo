import { create } from "zustand"

interface ResourceSessionType {
    currentPageNum: number;
    rangeStart: number;
    rangeEnd: number;

    setCurrentPage: (page: number) => void;
    setRange: (start: number, end: number) => void;

    previousPage: () => void;
    nextPage: () => void;
}

export const useResourceSession = create<ResourceSessionType>(
    (set) => ({
        currentPageNum: 0,
        rangeStart: 0,
        rangeEnd: 10,
        previousPage: () => (
            set((state) => ({
                currentPageNum: state.currentPageNum - 1
            })
            )),
        
        setCurrentPage: (page:number) => (
            set({
                currentPageNum: page
            })
        ),
        nextPage: () => (
            set((state) => ({
                currentPageNum: state.currentPageNum + 1
            })
            )),
        setRange: (start, end) => (
            set({
                rangeStart: start,
                rangeEnd: end
            })
        )
    }))