import { Avatar, CellList, CellSimple, IconButton } from "@maxhub/max-ui";
import { useEffect, useState } from "react";
import { getEventUsers, setRole } from "../../../api/requests";
import {
  Icon24CheckCircleFillGreen,
  Icon24User,
  Icon24UserOutline,
} from "@vkontakte/icons";

export const Users = ({ eventId, userId }) => {
  const [users, setUsers] = useState([]);
  const roles = {
    participant: "Участник",
    admin: "Администратор",
    creator: "Создатель",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getEventUsers(eventId);
        setUsers(response.data.users);
      } catch (error) {
        console.error("Ошибка при получении пользователей:", error);
      }
    };
    fetchData();
  }, []);

  const changeRole = async (userId, role) => {
    try {
      const updatedUsers = users.map((user) =>
        user.user_id === userId ? { ...user, role } : user
      );
      setUsers(updatedUsers);
      const response = await setRole(eventId, { user_id: userId, role: role });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <CellList filled mode="island">
      {users.map((user) => (
        <CellSimple
          key={user.id}
          before={
            <Avatar.Container
              size={56}
              overlay={
                user.status === 1 ? (
                  <Avatar.Overlay>
                    <Icon24CheckCircleFillGreen />
                  </Avatar.Overlay>
                ) : null
              }
            >
              <Avatar.Image
                fallback={(
                  user.first_name.charAt(0) + user.last_name.charAt(0)
                ).toUpperCase()}
                src={user.avatar}
              />
            </Avatar.Container>
          }
          after={
            user.role === "participant" ? (
              <IconButton
                appearance="themed"
                aria-label="Роль"
                mode="primary"
                size="large"
                onClick={()=>changeRole(user.user_id, "admin")}
              >
                <Icon24UserOutline />
              </IconButton>
            ) : (
              <IconButton
                appearance="themed"
                aria-label="Роль"
                mode="primary"
                size="large"
                onClick={()=>changeRole(user.user_id, "participant")}
              >
                <Icon24User />
              </IconButton>
            )
          }
          title={`${user.first_name} ${user.last_name}`}
          subtitle={roles[user.role]}
        />
      ))}
    </CellList>
  );
};
