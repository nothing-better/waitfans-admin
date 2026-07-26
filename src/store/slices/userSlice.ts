import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as authApi from '@/api/auth'
import { TOKEN_KEY } from '@/api/request'
import type { Credentials } from '@/api/auth'
import type { User } from '@/types/user'

interface UserState {
  current: User | null
  authenticated: boolean
  initialized: boolean
}

const initialState: UserState = { current: null, authenticated: false, initialized: false }

export const fetchAdminInfo = createAsyncThunk('admin/fetchInfo', authApi.getPersonalInfo)
export const loginAdmin = createAsyncThunk('admin/login', async (values: Credentials) => {
  const payload = await authApi.login(values)
  localStorage.setItem(TOKEN_KEY, payload.token)
  return payload.user
})
export const logoutAdmin = createAsyncThunk('admin/logout', authApi.logout)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearSession(state) {
      state.current = null
      state.authenticated = false
      state.initialized = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminInfo.fulfilled, (state, action) => {
        state.current = action.payload
        state.authenticated = true
        state.initialized = true
      })
      .addCase(fetchAdminInfo.rejected, (state) => {
        state.current = null
        state.authenticated = false
        state.initialized = true
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.current = action.payload
        state.authenticated = true
        state.initialized = true
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.current = null
        state.authenticated = false
      })
  },
})

export const { clearSession } = userSlice.actions
export default userSlice.reducer
