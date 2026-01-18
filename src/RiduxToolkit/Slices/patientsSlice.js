import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/Api/patientApi";

// -------------------------
// 1️⃣ جلب قائمة المرضى
// -------------------------
export const fetchPatients = createAsyncThunk(
  "data/fetchPatients",
  async ({ search = "", pageNumber = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.post("/PatientManagement/Get-Patients", {
        patientName: search,
        pageNumber,
        pageSize,
      });
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------------------
// 2️⃣ جلب طلبات المساعدة
// -------------------------
// افترضنا أن endpoint يقبل POST مع body JSON
export const fetchHelpRequests = createAsyncThunk(
  "data/fetchHelpRequests",
  async ({ search = "", pageNumber = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get("/SupportTicket/all", {
        params: { searchTerm: search, pageNumber, pageSize },
      });
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// -------------------------
// 3️⃣ حذف أو تعطيل مريض
// -------------------------
export const removePatient = createAsyncThunk(
  "data/removePatient",
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(`/PatientManagement/status/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------------------
// 4️⃣ جلب ملف مريض فردي
// -------------------------
export const fetchPatientProfile = createAsyncThunk(
  "data/fetchPatientProfile",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/PatientManagement/${id}`);
      // حسب API، هذا endpoint لا يعيد body، لذا نعيد id كمثال
      return { id };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------------------
// Slice الرئيسي
// -------------------------
const patientsSlice = createSlice({
  name: "data",
  initialState: {
    patients: [],
    helpRequests: [],
    selectedPatientProfile: null,
    loadingPatients: false,
    loadingHelpRequests: false,
    loadingProfile: false,
    errorPatients: null,
    errorHelpRequests: null,
    errorProfile: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // -------- المرضى --------
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loadingPatients = true;
        state.errorPatients = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loadingPatients = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loadingPatients = false;
        state.errorPatients = action.payload;
      })
      .addCase(removePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter(p => p.id !== action.payload);
      });

    // -------- طلبات المساعدة --------
    builder
      .addCase(fetchHelpRequests.pending, (state) => {
        state.loadingHelpRequests = true;
        state.errorHelpRequests = null;
      })
      .addCase(fetchHelpRequests.fulfilled, (state, action) => {
        state.loadingHelpRequests = false;
        state.helpRequests = action.payload;
      })
      .addCase(fetchHelpRequests.rejected, (state, action) => {
        state.loadingHelpRequests = false;
        state.errorHelpRequests = action.payload;
      });

    // -------- ملف مريض فردي --------
    builder
      .addCase(fetchPatientProfile.pending, (state) => {
        state.loadingProfile = true;
        state.errorProfile = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.loadingProfile = false;
        state.selectedPatientProfile = action.payload;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.loadingProfile = false;
        state.errorProfile = action.payload;
      });
  },
});

export default patientsSlice.reducer;
