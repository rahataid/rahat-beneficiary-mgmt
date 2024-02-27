const ROOTS = {
    AUTH: '/auth',
    DASHBOARD: '/dashboard',
    BENEFICIARY: '/beneficiary',
    USER: '/user',
    PROFILE: '/profile'
}

export const paths = {
    auth: {
        login: `${ROOTS.AUTH}/login`,
    },
    dashboard: {
        root: ROOTS.DASHBOARD,
        general: {
            beneficiary: ROOTS.BENEFICIARY,
            user: ROOTS.USER
        },
        profile: ROOTS.PROFILE
    },

}