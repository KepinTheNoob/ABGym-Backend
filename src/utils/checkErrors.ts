export const errorValidation = (error: any): boolean => {
  if (error.name === "ValidationError") {
    return true;
  }

  return false;
};

export const errorUnique = (error: any): boolean => {
  if (error.name === "PrismaClientKnownRequestError") {
    return true;
  }

  return false;
};
