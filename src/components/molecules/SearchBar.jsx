import React from "react";
import Input from "@/components/atoms/Input";

const SearchBar = ({ value, onChange, placeholder = "Search...", className }) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      icon="Search"
      iconPosition="left"
      className={className}
    />
  );
};

export default SearchBar;