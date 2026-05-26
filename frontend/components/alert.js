import Swal from "sweetalert2";

export const confirmDelete = async (title = "Are you sure?", text = "You won't be able to revert this!") => {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: "warning",
        showCancelButton: true,
        // Using your brand-primary for the confirm button
        confirmButtonColor: "#2d3748", 
        cancelButtonColor: "#e53e3e",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        // Making it match your rounded-sm look
        customClass: {
            popup: 'rounded-sm',
            confirmButton: 'rounded-sm uppercase text-xs tracking-widest',
            cancelButton: 'rounded-sm uppercase text-xs tracking-widest'
        }
    });

    return result.isConfirmed;
};

export const showSuccess = (title, text) => {
    Swal.fire({
        title: title,
        text: text,
        icon: "success",
        confirmButtonColor: "#2d3748",
        customClass: {
            popup: 'rounded-sm'
        }
    });
};