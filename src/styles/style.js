import { StyleSheet } from "react-native";

export default StyleSheet.create({

  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 150,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    top: 70,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#DB9556",
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  boxContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 15,
    width: 100,
    height: 100,
  },
  miniBoxContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 15,
    width: 50,
    height: 50,
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    borderBottomWidth: 2,
  },
  boxWrapper: {
    alignItems: "center",
  },
  iconStyle: {
    color: "white",
    fontSize: 30,
  },

});