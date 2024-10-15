/* eslint-disable prettier/prettier */
export const generateOTP = (): string => {
    // Generate a random number between 0 and 999999
    const otp = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return otp;
}

export const generateRandomString = (length = 6): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}