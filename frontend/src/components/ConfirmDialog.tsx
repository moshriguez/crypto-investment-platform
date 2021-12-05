import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material'

interface ConfirmDialogProps {
    open: boolean
    handleCloseConfirm: () => void
    dialogText: string
    confirmCallback: () => void
}
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, handleCloseConfirm, dialogText, confirmCallback }) => {
    return (
        <Dialog open={open} onClose={handleCloseConfirm} aria-describedby="alert-dialog-description">
            <DialogContent>
                <DialogContentText id="alert-dialog-description">{dialogText}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={confirmCallback} >Yes</Button>
                <Button onClick={handleCloseConfirm} >Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmDialog
