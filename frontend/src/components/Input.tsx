import React from "react";
import { IconButton, InputAdornment, Grid, TextField } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface InputProps {
  name: string;
  label: string;
  value: string
  half?: boolean;
  type?: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleShowPassword?: () => void;
}
const Input: React.FC<InputProps> = ({
  half,
  handleChange,
  handleShowPassword,
  label,
  name,
  type = "text",
  value
}) => {
  return (
    <Grid item xs={12} sm={half ? 6 : 12}>
      <TextField
      // use error and helperText prop to add validations and error notifications
        name={name}
        value={value}
        onChange={handleChange}
        variant="outlined"
        required
        fullWidth
        label={label}
        type={type}
        InputProps={
          name === "password"
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleShowPassword}>
                      {type === "password" ? (
                        <VisibilityIcon />
                      ) : (
                        <VisibilityOffIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : undefined
        }
      />
    </Grid>
  );
};

export default Input;
