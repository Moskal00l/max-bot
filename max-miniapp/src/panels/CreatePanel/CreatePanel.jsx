import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreatePanel.css";
import {
  Panel,
  Container,
  Flex,
  Typography,
  Input,
  Textarea,
  Grid,
  Button,
} from "@maxhub/max-ui";
import {
  Icon20LinkCircleOutline,
  Icon20MegaphoneOutline,
  Icon20PlaceOutline,
  Icon24CheckCircleFillGreen,
} from "@vkontakte/icons";
import { createEvent } from "../../api/requests";

export const CreatePanel = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    datetime: "",
    link: "",
  });
  const [status, setStatus] = useState(0);

  useEffect(() => {
    const backButtonApi = window?.WebApp?.BackButton;
    if (!backButtonApi) {
      return;
    }

    const handleBack = () => navigate(-1);

    backButtonApi.show?.();
    backButtonApi.onClick?.(handleBack);

    return () => {
      backButtonApi.offClick?.(handleBack);
      backButtonApi.hide?.();
    };
  }, [navigate]);

  const updateField =
    (field) =>
    ({ target }) => {
      setStatus(0);
      setForm((prev) => ({ ...prev, [field]: target.value }));
    };

  const handleSave = async (event) => {
    event.preventDefault();
    const response = await createEvent(form);
    setStatus(response.status);
  };

  const handleShare = () => {
    const payload = {
      title: form.title || "Новое событие",
      text: `${form.description || ""}${
        form.date ? `\nДата: ${form.date}` : ""
      }${form.time ? `\nВремя: ${form.time}` : ""}${
        form.location ? `\nМесто: ${form.location}` : ""
      }`,
      url: form.chatLink || window?.location?.href,
    };

    if (navigator?.share) {
      navigator.share(payload).catch(() => {});
    } else if (form.chatLink && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(form.chatLink).catch(() => {});
    }
  };

  return (
    <Panel mode="secondary" className="page">
      <Flex direction="column" gap={12} align="stretch">
        <Container>
          <Flex direction="column" gap={8}>
            <Typography.Headline variant="large-strong">
              Создание события
            </Typography.Headline>
            <Typography.Body>
              Заполните информацию о событии и поделитесь им с участниками
            </Typography.Body>
          </Flex>
        </Container>
        <Container>
          <form onSubmit={handleSave}>
            <Flex direction="column" gap={8} align="stretch">
              <label>
                <Typography.Label>Название события</Typography.Label>
                <Input
                  iconBefore={<Icon20MegaphoneOutline />}
                  value={form.title}
                  onChange={updateField("title")}
                  placeholder="Например, Встреча клуба"
                  required
                />
              </label>

              <label>
                <Typography.Label>Описание</Typography.Label>
                <Textarea
                  value={form.description}
                  onChange={updateField("description")}
                  placeholder="Расскажите, что будет происходить"
                />
              </label>

              <label>
                <Typography.Label>Место проведения</Typography.Label>
                <Input
                  value={form.location}
                  onChange={updateField("location")}
                  placeholder="Адрес или ссылка"
                  iconBefore={<Icon20PlaceOutline />}
                />
              </label>
              <label>
                <Typography.Label>Дата</Typography.Label>
                <Input
                  type="datetime-local"
                  value={form.datetime}
                  onChange={updateField("datetime")}
                  required
                />
              </label>

              <label>
                <Typography.Label>Ссылка на чат события</Typography.Label>
                <Input
                  value={form.chatLink}
                  onChange={updateField("chatLink")}
                  placeholder="https://vk.com/..."
                  iconBefore={<Icon20LinkCircleOutline />}
                />
              </label>

              <Button
                type="submit"
                size="large"
                iconBefore={
                  status === 201 ? (
                    <Icon24CheckCircleFillGreen />
                  ) : (
                    null
                  )
                }
              >
                Сохранить
              </Button>
            </Flex>
          </form>
        </Container>
      </Flex>
    </Panel>
  );
};
