import { useEffect, useState } from "react";
import landScape from "../images/landscape.jpg";
import profilePic from "../images/profilepic.jpg";
import Input from "./Input";
import Button from "./Button";
import Image from "./Image";

const Profile = () => {
  const [balance, setBalance] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(true);
  const [editBalance, setEditBalance] = useState<boolean>(false);
  const [onConfirm, setOnConfirm] = useState<boolean>(false);

  useEffect(() => {
    const user = localStorage.getItem("user")?.replace(/"/g, "");
    const getBalance = async () => {
      try {
        const response = await fetch(`http://localhost:8080/balance/${user}`);

        if (!response.ok) {
          console.log("Response is not ok");
          return;
        }

        const jsonResponse = await response.json();
        setBalance(jsonResponse.balance);
      } catch (err) {
        console.log("Não foi possível conectar a URL");
      }
    };

    getBalance();
  }, [onConfirm]);

  const valueState = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBalance(event.target.value);
  };

  const onEdit = () => {
    setEditBalance(true);
    setDisabled(false);
  };

  const onValueHander = async () => {
    const user = localStorage.getItem("user")?.replace(/"/g, "");
    try {
      await fetch("http://localhost:8080/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, balance }),
      });
    } catch (err) {
      console.log("Não foi possível acessar o backend");
    }
    setOnConfirm(!onConfirm);
  };

  return (
    <div
      className="flex items-center justify-center h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${landScape})` }}
    >
      <div className="flex flex-col items-center justify-center h-screen">
        <Image src={profilePic} alt="Profile Pic" />
        <div className="max-w-md w-full bg-black bg-opacity-60 shadow-mg rounded-md p-6">
          <Input
            id="balance"
            name="balance"
            type="text"
            value={balance}
            placeholder="Insert your initial balance"
            className="block w-full mb-2 px-12 rounded-md shadow-sm focus:ring-0 border-transparent bg-transparent text-gray-400 text-white text-center text-lg"
            onChange={valueState}
            disabled={disabled}
          />
          <hr />
          <Button
            type="submit"
            className="bg-yellow-500 mt-5 p-4 w-full text-white"
            onClick={editBalance ? onValueHander : onEdit}
          >
            {editBalance ? "Confirm" : "Edit Balance"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
