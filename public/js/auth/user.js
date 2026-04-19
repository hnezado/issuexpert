export async function loadCurrentUser() {
  const token = localStorage.getItem("auth_token");

  try {
    const res = await fetch(`${API_BASE_URL}/auth/user-info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Error retrieving user data");
      return null;
    }

    const data = await res.json();
    return data.user;
  } catch (err) {
    console.error(err);
    return null;
  }
}
