import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/lib/supabase"


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export async function uploadResumeToBucket(file: File) {

    // 1. upload the file to supabase storage
    const fileName = `${Date.now()}_${file.name}`; // Create a unique file name using timestamp

    const {data, error} = await supabase.storage
        .from("resumes")
        .upload(fileName, file);

    if (error) {
        console.error("Error uploading file:", error);
        throw new Error("Failed to upload the resume. Please try again.");
    }

    // 2. get the public url of the uploaded resume back from supabase
    const { data: urlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(data.path);

    return {
        fileUrl: urlData.publicUrl,
        fileName: fileName,
        storagePath: data.path
    }
}

export async function deleteResumeFromBucket( resumeName: string ) {
    try {
        const { data, error } = await supabase.storage
            .from("resumes")
            .remove([resumeName])
    } catch (error) {
        console.error("error deleting resume from storage", error);
    }
}